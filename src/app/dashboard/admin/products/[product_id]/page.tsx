
export default async function ProductDetails({params,}:{params : Promise <{product_id : string}>;
}){
    const product_id = (await params).product_id;
    return <h2>Product Details of product {product_id} is showing</h2>
}

