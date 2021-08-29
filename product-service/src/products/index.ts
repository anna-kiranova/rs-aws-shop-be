import data from './data.json';
import Product from './types';

export const list = (): Promise<Product[]> => {
    return Promise.resolve(data);
}

export const getById = async (id: number): Promise<Product | null> => {
    const products = await list();
    const product = products.find((p) => p.id === id);
    return product || null;
}
