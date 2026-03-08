// Product type definitions

export type BlouseOption = {
    kind: "running" | "contrast" | "matching" | "none";
    included: boolean;
    price: number;
    label: string;
};

export type Product = {
    id: string;
    name: string;
    basePrice: number;
    category: string;
    sareeType: string;
    material: string;
    fabric: string;
    color: string;
    image: string;
    images: string[];
    description: string;
    featured: boolean;
    madeToOrder: boolean;
    blouseIncluded: "running" | "contrast" | "matching" | "none";
    blouseOptions: BlouseOption[];
};
