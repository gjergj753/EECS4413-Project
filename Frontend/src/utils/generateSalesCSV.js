export function generateSalesCSV(filteredSales, filters) {
  const rows = [];

  // Header
  rows.push(["Date", "Order ID", "Total Cost"]);

  let totalSales = 0;

  filteredSales.forEach(order => {
    const date = new Date(order.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
    
    const total = order.totalPrice || 0;
    totalSales += total;

    rows.push([date, order.orderId, total.toFixed(2)]);
  });

  const from = filters.fromDate || "start";
  const to = filters.toDate || "end";

  // Summary row
  rows.push([``, "Total", `$${totalSales.toFixed(2)}`]);

  // make CSV
  const csvContent = rows.map(r => r.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Sales Report ${from} TO ${to}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}
