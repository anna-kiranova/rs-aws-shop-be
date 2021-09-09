import { Client, ClientConfig } from 'pg';
import { Product, ProductData, ProductsRow, StocksRow } from './types';

const config: ClientConfig = {
    host: process.env.PGHOST,
    port: Number.parseInt(process.env.PGPORT),
    database: process.env.PGDATABASE,
    user: process.env.PGUSERNAME,
    password: process.env.PGPASSWORD,
};

const getClient: () => Promise<Client> = async() => {
    const client = new Client(config);
    await client.connect()
    return client;
}

export const list = async (): Promise<Product[]> => {
    const client = await getClient();
    let res;
    try {
        res = await client.query(
            'select products.id, products.title, products.description, products.price, stocks.count from stocks join products on products.id = stocks.product_id'
        );
    } finally {
        client.end();
    }
    return res.rows as Product[];
}

export const getById = async (id: string): Promise<Product | null> => {
    const client = await getClient();
    let res;
    try {
        res = await client.query(
            'select products.id, products.title, products.description, products.price, stocks.count from stocks join products on products.id = stocks.product_id where products.id = $1',
            [id]
        );
    } finally {
        client.end()
    }
    if (res.rows.length > 0) {
        return res.rows[0] as Product;
    }
    return null;
}

export const create = async (productData: ProductData): Promise<Product> => {
    console.log('create', productData);
    const client = await getClient();
    let res;
    await client.query('begin');
    try {
        res = await client.query(
            'insert into products(title, description, price) values ($1, $2, $3) returning *', [productData.title, productData.description, productData.price]
        );
        if (res.rows.length <= 0) {
            throw new Error('Failed to created product row');
        }
        const createdProductRow: ProductsRow = res.rows[0];
        res = await client.query(
            'insert into stocks(product_id, count) values ($1, $2) returning *', [createdProductRow.id, productData.count]
        )
        if (res.rows.length <= 0) {
            throw new Error('Failed to created stocks row');
        }
        await client.query('commit');
        const createdStocksRow: StocksRow = res.rows[0];
        return { ...createdProductRow, count: createdStocksRow.count };
    } catch (e) {
        await client.query('rollback');
        throw e;
    } finally {
        client.end()
    }
}
