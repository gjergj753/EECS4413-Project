package com.example.backend.services;

import com.example.backend.dto.*;
import com.example.backend.entity.*;
import com.example.backend.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

// Service for order management - creating orders, viewing order history
@Service
@Transactional
public class OrderService {

    private final OrderRepo orderRepo;
    private final UserRepo userRepo;
    private final CartRepo cartRepo;
    private final PaymentRepo paymentRepo;
    private final PaymentMethodRepository paymentMethodRepository;
    private final AddressRepo addressRepo;
    private final BookRepo bookRepo;
    private final MockPaymentProcessor mockPaymentProcessor;

    public OrderService(OrderRepo orderRepo,
                       UserRepo userRepo,
                       CartRepo cartRepo,
                       PaymentRepo paymentRepo,
                       PaymentMethodRepository paymentMethodRepository,
                       AddressRepo addressRepo,
                       BookRepo bookRepo,
                       MockPaymentProcessor mockPaymentProcessor) {
        this.orderRepo = orderRepo;
        this.userRepo = userRepo;
        this.cartRepo = cartRepo;
        this.paymentRepo = paymentRepo;
        this.paymentMethodRepository = paymentMethodRepository;
        this.addressRepo = addressRepo;
        this.bookRepo = bookRepo;
        this.mockPaymentProcessor = mockPaymentProcessor;
    }

    // Get all orders (admin function)
    public List<OrderDto> getAllOrders() {
        return orderRepo.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<OrderDto> getUserOrders(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Page<Order> orders = orderRepo.findByUser_UserId(userId, Pageable.unpaged());
        return orders.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Get specific order by ID
    public OrderDto getOrderById(Long id) {
        Order order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        return convertToDto(order);
    }

    // Create order from user's cart
    public OrderDto createOrderFromCart(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Cart cart = cartRepo.findByUserUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found for user: " + userId));

        if (cart.getCartItemList().isEmpty()) {
            throw new RuntimeException("Cannot create order from empty cart");
        }

        // Create new order
        Order order = new Order();
        order.setUser(user);
        order.setStatus("PENDING");

        // Convert cart items to order items and calculate total
        BigDecimal totalPrice = BigDecimal.ZERO;
        for (CartItem cartItem : cart.getCartItemList()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setBook(cartItem.getBook());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(cartItem.getBook().getPrice());

            order.getOrderItemList().add(orderItem);

            // Calculate total: price * quantity
            BigDecimal itemTotal = cartItem.getBook().getPrice()
                    .multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalPrice = totalPrice.add(itemTotal);
        }

        order.setTotalPrice(totalPrice);

        // Save order and clear cart
        Order savedOrder = orderRepo.save(order);
        cart.getCartItemList().clear();
        cartRepo.save(cart);

        return convertToDto(savedOrder);
    }

    // Checkout with payment processing
    public OrderDto checkout(CheckoutRequest request) {
        User user = userRepo.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartRepo.findByUserUserId(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        if (cart.getCartItemList().isEmpty()) {
            throw new RuntimeException("Cannot checkout with empty cart");
        }

        // Calculate order total and create order
        Order order = new Order();
        order.setUser(user);
        order.setStatus("PENDING_PAYMENT");

        if (request.getAddressId() != null) {
            // Using saved address
            Address address = addressRepo.findById(request.getAddressId())
                    .orElseThrow(() -> new RuntimeException("Address not found"));

            // Verify address belongs to user
            if (!address.getUser().getUserId().equals(request.getUserId())) {
                throw new RuntimeException("Address does not belong to user");
            }

            order.setShippingStreet(address.getStreet());
            order.setShippingCity(address.getCity());
            order.setShippingProvince(address.getProvince());
            order.setShippingPostalCode(address.getPostalCode());
            order.setShippingCountry(address.getCountry());

        } else if (request.getTemporaryAddress() != null) {
            // Using temporary address
            CheckoutRequest.TemporaryAddressInfo tempAddr = request.getTemporaryAddress();

            order.setShippingStreet(tempAddr.getStreet());
            order.setShippingCity(tempAddr.getCity());
            order.setShippingProvince(tempAddr.getProvince());
            order.setShippingPostalCode(tempAddr.getPostalCode());
            order.setShippingCountry(tempAddr.getCountry());

            // Save address if user requested it
            if (request.isSaveAddress()) {
                Address newAddress = new Address();
                newAddress.setUser(user);
                newAddress.setStreet(tempAddr.getStreet());
                newAddress.setCity(tempAddr.getCity());
                newAddress.setProvince(tempAddr.getProvince());
                newAddress.setPostalCode(tempAddr.getPostalCode());
                newAddress.setCountry(tempAddr.getCountry());
                addressRepo.save(newAddress);
            }

        } else {
            throw new RuntimeException("No address information provided");
        }

        BigDecimal totalPrice = BigDecimal.ZERO;
        for (CartItem cartItem : cart.getCartItemList()) {
            // Check if book has enough stock
            Book book = cartItem.getBook();
            if (book.getQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for book: " + book.getTitle());
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setBook(book);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(book.getPrice());

            order.getOrderItemList().add(orderItem);

            BigDecimal itemTotal = book.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalPrice = totalPrice.add(itemTotal);
        }

        order.setTotalPrice(totalPrice);

        // Process payment
        boolean paymentAccepted = false;
        Payment payment = new Payment();
        payment.setPaymentAmount(totalPrice);
        payment.setOrder(order);

        // Check if using saved payment method or temporary payment info
        if (request.getPaymentMethodId() != null) {
            // Using saved payment method
            PaymentMethod paymentMethod = paymentMethodRepository
                    .findByPaymentMethodIdAndUser_UserId(request.getPaymentMethodId(), request.getUserId())
                    .orElseThrow(() -> new RuntimeException("Payment method not found"));

            paymentAccepted = mockPaymentProcessor.processPaymentWithToken(
                    paymentMethod.getPaymentToken(),
                    totalPrice.doubleValue()
            );

            payment.setPaymentMethod(paymentMethod);
            payment.setCardLast4(paymentMethod.getCardLast4());
            payment.setCardBrand(paymentMethod.getCardBrand());
            payment.setPaymentToken(paymentMethod.getPaymentToken());

        } else if (request.getTemporaryPayment() != null) {
            // Using temporary payment info
            CheckoutRequest.TemporaryPaymentInfo tempPayment = request.getTemporaryPayment();

            paymentAccepted = mockPaymentProcessor.processPayment(
                    tempPayment.getCardNumber(),
                    tempPayment.getCardBrand(),
                    tempPayment.getCvv(),
                    tempPayment.getExpiryMonth(),
                    tempPayment.getExpiryYear(),
                    totalPrice.doubleValue()
            );

            // Extract last 4 digits for record
            String last4 = tempPayment.getCardNumber().substring(
                    Math.max(0, tempPayment.getCardNumber().length() - 4)
            );

            payment.setCardLast4(last4);
            payment.setCardBrand(tempPayment.getCardBrand());
            payment.setPaymentToken("temp_" + System.currentTimeMillis());

            // Save payment info if user requested it
            if (request.isSavePaymentMethod()) {
                PaymentMethod newMethod = new PaymentMethod();
                newMethod.setUser(user);
                newMethod.setCardLast4(last4);
                newMethod.setCardBrand(tempPayment.getCardBrand());
                newMethod.setExpiryMonth(tempPayment.getExpiryMonth());
                newMethod.setExpiryYear(tempPayment.getExpiryYear());
                newMethod.setPaymentToken(payment.getPaymentToken());

                // Set as default if user has no payment methods
                List<PaymentMethod> existingMethods = paymentMethodRepository.findByUser_UserId(request.getUserId());
                newMethod.setDefault(existingMethods.isEmpty());

                PaymentMethod savedMethod = paymentMethodRepository.save(newMethod);
                payment.setPaymentMethod(savedMethod);
            }

        } else {
            throw new RuntimeException("No payment information provided");
        }

        // Handle payment result
        if (!paymentAccepted) {
            throw new RuntimeException("Credit Card Authorization Failed");
        }

        // Payment accepted - complete the order
        order.setStatus("PAID");
        order.setPayment(payment);

        // Reduce book quantities
        for (CartItem cartItem : cart.getCartItemList()) {
            Book book = cartItem.getBook();
            book.setQuantity(book.getQuantity() - cartItem.getQuantity());
            bookRepo.save(book);
        }

        // Save order
        Order savedOrder = orderRepo.save(order);

        // Clear cart
        cart.getCartItemList().clear();
        cartRepo.save(cart);

        return convertToDto(savedOrder);
    }

    // Update order status
    public OrderDto updateOrderStatus(Long orderId, String status) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        order.setStatus(status);
        Order updatedOrder = orderRepo.save(order);
        return convertToDto(updatedOrder);
    }

    // Cancel order (if still pending)
    public void cancelOrder(Long orderId) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        if (!"PENDING".equals(order.getStatus())) {
            throw new RuntimeException("Only pending orders can be cancelled");
        }

        orderRepo.delete(order);
    }

    // Get the sales history based on the user, products, and time frame
    public Page<OrderDto> getSalesHistory(
            int page,
            int size,
            Long customerId,
            Long productId,
            LocalDate from,
            LocalDate to
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        LocalDateTime startDateTime = null;
        LocalDateTime endDateTime = null;

        if (from != null && to != null) {
            startDateTime = from.atStartOfDay();
            endDateTime = to.atTime(LocalTime.MAX);
        }

        Page<Order> ordersPage;

        // Decide which repo method to call based on what filters are provided
        if (customerId != null && startDateTime != null && productId == null) {
            ordersPage = orderRepo.findByUser_UserIdAndCreatedAtBetween(customerId, startDateTime, endDateTime, pageable);
        } else if (customerId != null && productId == null) {
            ordersPage = orderRepo.findByUser_UserId(customerId, pageable);
        } else if (productId != null && startDateTime != null) {
            ordersPage = orderRepo.findByProductAndDateRange(productId, startDateTime, endDateTime, pageable);
        } else if (productId != null) {
            ordersPage = orderRepo.findByProduct(productId, pageable);
        } else if (startDateTime != null) {
            ordersPage = orderRepo.findByCreatedAtBetween(startDateTime, endDateTime, pageable);
        } else {
            // No filters, return all orders
            ordersPage = orderRepo.findAll(pageable);
        }
        return ordersPage.map(this::convertToDto);
    }



    // Convert Order entity to OrderDto
    private OrderDto convertToDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setOrderId(order.getOrderId());
        dto.setTotalPrice(order.getTotalPrice());
        dto.setStatus(order.getStatus());
        dto.setCreatedAt(order.getCreatedAt());

        // Include shipping address
        dto.setShippingStreet(order.getShippingStreet());
        dto.setShippingCity(order.getShippingCity());
        dto.setShippingProvince(order.getShippingProvince());
        dto.setShippingPostalCode(order.getShippingPostalCode());
        dto.setShippingCountry(order.getShippingCountry());

        if (order.getUser() != null) {
            dto.setUser(convertUserToDto(order.getUser()));
        }

        // Convert order items without circular references
        if (order.getOrderItemList() != null) {
            dto.setOrderItemList(order.getOrderItemList().stream()
                    .map(this::convertOrderItemToDto)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    // Convert OrderItem to OrderItemDto
    private OrderItemDto convertOrderItemToDto(OrderItem orderItem) {
        OrderItemDto dto = new OrderItemDto();
        dto.setOrderItemId(orderItem.getOrderItemId());
        dto.setQuantity(orderItem.getQuantity());
        dto.setPrice(orderItem.getPrice());

        // Include book info
        if (orderItem.getBook() != null) {
            dto.setBook(convertBookToDto(orderItem.getBook()));
        }

        return dto;
    }

    // Convert Book to BookDto
    private BookDto convertBookToDto(Book book) {
        BookDto dto = new BookDto();
        dto.setBookId(book.getBookId());
        dto.setTitle(book.getTitle());
        dto.setAuthor(book.getAuthor());
        dto.setPrice(book.getPrice());
        dto.setDescription(book.getDescription());
        dto.setIsbn(book.getIsbn());
        dto.setImageUrl(book.getImageUrl());
        dto.setQuantity(book.getQuantity());
        dto.setYear(book.getYear());
        dto.setGenres(book.getGenres());
        return dto;
    }

    private UserDto convertUserToDto(User user) {
        UserDto dto = new UserDto();
        dto.setUserId(user.getUserId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setAdmin(user.isAdmin());
        // Don't set password for security
        return dto;
    }
}

