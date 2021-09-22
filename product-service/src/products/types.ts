export interface ProductsRowData {
    title: string;
    description: string;
    price: number;
}

export interface ProductsRow extends ProductsRowData {
    id: string;
}
export interface ProductData extends ProductsRowData {
    count: number;
}

export interface Product extends ProductData {
    id: string;
}

export interface StocksRowData {
    count: number;
}

export interface StocksRow extends StocksRowData {
    product_id: string;
}
