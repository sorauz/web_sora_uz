import { Category } from "../schemas/category";
import { Unit } from "../schemas/unit";
import { BrandsResponse } from "../schemas/brand";
import { ProductPriceStock } from "../schemas/price";
import { Product } from "../schemas/product";

export const FIXTURE_CATEGORIES: Category[] = [
  {
    id: "c9b2b5a1-7c3d-11eb-a835-0050569f41b3",
    group_uz: "Ofis jihozlari va kanselyariya",
    group_ru: "Офисная техника и канцелярия",
    group_slug_uz: "ofis-jihozlari-va-kanselyariya",
    group_slug_ru: "ofisnaya-tekhnika-i-kancelyariya",
    parent_id: "",
  },
  {
    id: "e8d3b4a2-7c3d-11eb-a835-0050569f41b4",
    group_uz: "Bog'lash mashinalari (Perforatorlar)",
    group_ru: "Переплетные машины",
    group_slug_uz: "boglash-mashinalari",
    group_slug_ru: "perepletnye-mashiny",
    parent_id: "c9b2b5a1-7c3d-11eb-a835-0050569f41b3",
    parent_name_uz: "Ofis jihozlari va kanselyariya",
    parent_name_ru: "Офисная техника и канцелярия",
  },
  {
    id: "f1a2b3c4-7c3d-11eb-a835-0050569f41b5",
    group_uz: "Kalkulyatorlar",
    group_ru: "Калькуляторы",
    group_slug_uz: "kalkulyatorlar",
    group_slug_ru: "kalkulyatory",
    parent_id: "c9b2b5a1-7c3d-11eb-a835-0050569f41b3",
    parent_name_uz: "Ofis jihozlari va kanselyariya",
    parent_name_ru: "Офисная техника и канцелярия",
  },
  {
    id: "a1b2c3d4-7c3d-11eb-a835-0050569f41b6",
    group_uz: "Elektronika",
    group_ru: "Электроника",
    group_slug_uz: "elektronika",
    group_slug_ru: "elektronika",
    parent_id: "",
  },
  {
    id: "b2c3d4e5-7c3d-11eb-a835-0050569f41b7",
    group_uz: "Smartfonlar",
    group_ru: "Смартфоны",
    group_slug_uz: "smartfonlar",
    group_slug_ru: "smartfony",
    parent_id: "a1b2c3d4-7c3d-11eb-a835-0050569f41b6",
    parent_name_uz: "Elektronika",
    parent_name_ru: "Электроника",
  },
];

export const FIXTURE_UNITS: Unit[] = [
  {
    id: "7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
    name: "Штука",
    unit_uz: "dona",
    unit_ru: "шт",
  },
  {
    id: "8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e",
    name: "Килограмм",
    unit_uz: "kg",
    unit_ru: "кг",
  },
  {
    id: "9c0d1e2f-3a4b-5c6d-7e8f-9a0b1c2d3e4f",
    name: "Упаковка",
    unit_uz: "o'ram",
    unit_ru: "упак",
  },
];

export const FIXTURE_BRANDS: BrandsResponse = {
  brands: [
    { id: "5538dd87-1e18-11ed-80c3-00155d016811", name: "DELI" },
    { id: "3542aa32-b7ce-11ec-81b6-00155d016806", name: "Samsung" },
    { id: "3542aa33-b7ce-11ec-81b6-00155d016807", name: "Logitech" },
    { id: "3542aa39-b7ce-11ec-81b6-00155d016808", name: "SIGNUM" },
  ],
  manufacturers: [
    { id: "m1", name: "Deli Group Co" },
    { id: "m2", name: "Samsung Electronics" },
  ],
  countries: [
    { id: "c1", name: "China" },
    { id: "c2", name: "Vietnam" },
  ],
};

export const FIXTURE_PRICES: Record<string, ProductPriceStock> = {
  "70ee3bb2-cd83-11ea-96bb-50b7c370a30f": {
    id: "70ee3bb2-cd83-11ea-96bb-50b7c370a30f",
    stock: "InStock",
    quantity_remaining: 45,
    unit_ru: "шт",
    unit_uz: "dona",
    retail_price: 1150000,
    dealer_price: 1050000,
    wholesale_price: 980000,
    currency: "UZS",
  },
  "123e4567-e89b-12d3-a456-426614174000": {
    id: "123e4567-e89b-12d3-a456-426614174000",
    stock: "InStock",
    quantity_remaining: 12,
    unit_ru: "шт",
    unit_uz: "dona",
    retail_price: 11200000,
    dealer_price: 10500000,
    wholesale_price: 9900000,
    currency: "UZS",
  },
};

export const FIXTURE_PRODUCTS: Product[] = [
  {
    id: "70ee3bb2-cd83-11ea-96bb-50b7c370a30f",
    product_sku: "Deli E3871",
    package: "1/4",
    barcode: "6921734938718",
    brand: "DELI",
    manufacturer: "Deli Group Co",
    country: "China",
    video_url: "",
    main_picture: "https://i.ibb.co/qLcGdmjh/Deli-E3871.jpg",
    updated_at: "2026-09-28T00:00:00",
    uz: {
      unit_uz: "dona",
      category_uz: "Ofis jihozlari va kanselyariya",
      category_slug_uz: "ofis-jihozlari-va-kanselyariya",
      alt_picture_uz: "Deli 3871 Plastik prujinali bog‘lash mashinasi",
      name_uz: "Plastik prujinali bog‘lash mashinasi Deli 3871",
      slug_uz: "mashina-dlya-perepleta-ssh-350l-prob-12l-f-a4-deli-e3871",
      title_uz: "Deli 3871 Plastik prujinali bog‘lash mashinasi sotib olish",
      meta_description_uz:
        "Deli 3871 – 2-in-1 perforator va bog‘lovchi. Qulay dastak, aniq kesish, barqaror korpus. Ofis va uy uchun ishonchli, A4 hujjatlar uchun professional yechim.",
      short_description_uz:
        "Deli 3871 – 2-in-1 perforator va bog‘lovchi qurilma. Qulay dastagi 30% kamroq kuch talab qiladi, mustahkam karbid pichoqlar aniq teshadi.",
      product_description_uz:
        "2-in-1 dizayni – qurilma bir vaqtning o‘zida perforator va bog‘lovchi vazifasini bajaradi.\nQulay dastagi – bir tutqichli teshish tizimi ishlatish uchun qulay va 30% kamroq kuch talab qiladi.\nAniq kesish – mustahkam karbid pichoqlar aniq va bir tekis teshilishni taʼminlaydi.",
    },
    ru: {
      unit_ru: "шт",
      category_ru: "Офисная техника и канцелярия",
      category_slug_ru: "ofisnaya-tekhnika-i-kancelyariya",
      alt_picture_ru: "Машина для скрепления пластиковых пружин Deli 3871",
      name_ru: "Машина для скрепления пластиковых пружин Deli 3871",
      slug_ru: "mashina-dlya-skepleniiya-plastikovix-purjin-deli-3871",
      title_ru: "Купить переплетную машину Deli 3871 в Ташкенте",
      meta_description_ru:
        "Deli 3871 — устройство «2 в 1»: дырокол и переплетчик. Удобная ручка, точная пробивка, устойчивый корпус для офиса и дома.",
      short_description_ru:
        "Deli 3871 — устройство «2 в 1», сочетающее функции дырокола и степлера с эргономичной рукояткой.",
      product_description_ru:
        "Конструкция 2-в-1 – устройство одновременно выполняет функции перфоратора и переплетчика.\nУдобная ручка – система перфорации с одной ручкой проста в использовании.\nТочная резка – прочные твердосплавные лезвия.",
    },
    attributes: [
      {
        property_uz: "Brend",
        property_ru: "Бренд",
        value_uz: "DELI",
        value_ru: "DELI",
      },
      {
        property_uz: "Format",
        property_ru: "Формат",
        value_uz: "A4",
        value_ru: "A4",
      },
      {
        property_uz: "Bir martalik teshish quvvati",
        property_ru: "Количество пробиваемых листов",
        value_uz: "12 varaq",
        value_ru: "12 листов",
      },
      {
        property_uz: "Maksimal bog'lash sig'imi",
        property_ru: "Максимальная толщина переплета",
        value_uz: "350 varaq",
        value_ru: "350 листов",
      },
    ],
    related_products: [
      {
        id: "rel-1",
        slug: "deli-e3870",
        name: "Bog'lash mashinasi Deli E3870 (Metal prujina)",
        title: "Deli E3870",
        short_description: "Muqobil metal prujinali variant",
        picture: "https://i.ibb.co/qLcGdmjh/Deli-E3871.jpg",
      },
    ],
    recommended_products: [
      {
        id: "rec-1",
        slug: "plastik-prujina-12mm",
        name: "Plastik prujinalar A4 12mm (100 dona)",
        title: "Prujinalar to'plami",
        short_description: "Bog'lash mashinasi uchun sarflovchi material",
        picture: "https://i.ibb.co/qLcGdmjh/Deli-E3871.jpg",
      },
      {
        id: "rec-2",
        slug: "shaffof-muqova-a4",
        name: "Shaffof A4 muqovalar (100 dona)",
        title: "A4 Muqovalar",
        short_description: "Hujjatlar uchun old muqova",
        picture: "https://i.ibb.co/qLcGdmjh/Deli-E3871.jpg",
      },
    ],
    price: FIXTURE_PRICES["70ee3bb2-cd83-11ea-96bb-50b7c370a30f"],
  },
];
