import API_BASE_URL from "./api";
import axios from "axios";


export async function getGenres() {
    return axios
        .get(`${API_BASE_URL}/catalog/genres`)
        .then(res => res.data)
        .catch(err => { throw err; });
}


export async function listBooks({
                                    page = 0,
                                    size = 20,
                                    sort = "title",
                                    search = "",
                                    genre = ""
                                }) {
    return axios
        .get(`${API_BASE_URL}/catalog/books`, {
            params: { page, size, sort, search, genre }
        })
        .then(res => res.data)
        .catch(err => { throw err; });
}


export async function fetchBookById(id) {
    return axios
        .get(`${API_BASE_URL}/catalog/books/${id}`)
        .then(res => res.data)
        .catch(err => { throw err; });
}
