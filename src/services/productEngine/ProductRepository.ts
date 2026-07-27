/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-011
 * Product Repository Interface & Implementation (v3.2)
 */

import { ProductRecord, ProductSummary, ProductFilterOptions } from './types';
import { ProductMapper } from './ProductMapper';

export interface IProductRepository {
  getAllByOrganization(organizationId: string, filters?: Partial<ProductFilterOptions>): Promise<ProductRecord[]>;
  getById(id: string, organizationId: string): Promise<ProductRecord | null>;
  getBySku(sku: string, organizationId: string): Promise<ProductRecord | null>;
  create(product: ProductRecord): Promise<ProductRecord>;
  update(id: string, product: Partial<ProductRecord>, organizationId: string): Promise<ProductRecord | null>;
  softDelete(id: string, organizationId: string): Promise<boolean>;
  getSummary(organizationId: string): Promise<ProductSummary>;
}

// Initial Enterprise Master Seed Products with Catalog Relationships
const INITIAL_PRODUCT_SEED: ProductRecord[] = [
  {
    id: 'prod_101',
    organizationId: 'org_acme_corp',
    sku: 'PHX-EVO-PRO',
    barcode: '88091234001',
    productName: 'Phoenix EVO Enterprise Workstation',
    description: 'High-performance computing node designed for edge AI inference & enterprise workloads.',
    unit: 'PCS',
    basePrice: 1450.0,
    sellingPrice: 2499.0,
    minimumStock: 20,
    status: 'active',
    categoryId: 'cat_hardware',
    categoryName: 'Computing & Server Hardware',
    brandId: 'brand_phoenix',
    brandName: 'Phoenix Core',
    tags: ['High Margin', 'Enterprise Only'],
    images: [
      {
        id: 'img_101_1',
        organizationId: 'org_acme_corp',
        productId: 'prod_101',
        url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80',
        isPrimary: true,
        altText: 'Phoenix EVO Workstation Tower',
        sortOrder: 0,
        createdAt: '2026-01-10T08:00:00Z',
      },
    ],
    metadata: { processor: 'Intel Xeon Platinum 8480+', memory: '256GB ECC DDR5', rackUnit: '4U' },
    settings: {
      allowDiscounts: true,
      isTaxable: true,
      taxRate: 10,
      trackSerialNumbers: true,
      barcodeType: 'EAN-13',
      allowBackorders: true,
      defaultLeadTimeDays: 14,
    },
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-07-20T12:00:00Z',
  },
  {
    id: 'prod_102',
    organizationId: 'org_acme_corp',
    sku: 'PHX-SENS-HUB',
    barcode: '88091234002',
    productName: 'IoT Industrial Sensor Gateway Node',
    description: 'Multi-protocol telemetry gateway with IP67 ruggedized enclosure and optical bus.',
    unit: 'PCS',
    basePrice: 210.0,
    sellingPrice: 489.0,
    minimumStock: 15,
    status: 'active',
    categoryId: 'cat_networking',
    categoryName: 'Networking & Cabling',
    brandId: 'brand_phoenix',
    brandName: 'Phoenix Core',
    tags: ['Critical Spare', 'Fast Moving'],
    images: [
      {
        id: 'img_102_1',
        organizationId: 'org_acme_corp',
        productId: 'prod_102',
        url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
        isPrimary: true,
        altText: 'IoT Gateway Module',
        sortOrder: 0,
        createdAt: '2026-02-01T10:30:00Z',
      },
    ],
    metadata: { ingressRating: 'IP67', connectivity: 'LoRaWAN + 5G + RS485' },
    settings: {
      allowDiscounts: true,
      isTaxable: true,
      taxRate: 10,
      trackSerialNumbers: true,
      barcodeType: 'EAN-13',
      allowBackorders: false,
      defaultLeadTimeDays: 7,
    },
    createdAt: '2026-02-01T10:30:00Z',
    updatedAt: '2026-07-22T14:15:00Z',
  },
  {
    id: 'prod_103',
    organizationId: 'org_acme_corp',
    sku: 'PHX-AI-ACCEL',
    barcode: '88091234003',
    productName: 'Edge Neural Coprocessor PCI Module',
    description: 'PCIe Gen5 neural accelerator card delivering 320 TOPS FP16 execution.',
    unit: 'PCS',
    basePrice: 780.0,
    sellingPrice: 1299.0,
    minimumStock: 25,
    status: 'active',
    categoryId: 'cat_hardware',
    categoryName: 'Computing & Server Hardware',
    brandId: 'brand_phoenix',
    brandName: 'Phoenix Core',
    tags: ['High Margin'],
    images: [
      {
        id: 'img_103_1',
        organizationId: 'org_acme_corp',
        productId: 'prod_103',
        url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&auto=format&fit=crop&q=80',
        isPrimary: true,
        altText: 'PCIe Coprocessor Card',
        sortOrder: 0,
        createdAt: '2026-03-05T09:00:00Z',
      },
    ],
    metadata: { interface: 'PCIe Gen 5 x16', powerDraw: '225W' },
    settings: {
      allowDiscounts: false,
      isTaxable: true,
      taxRate: 10,
      trackSerialNumbers: true,
      barcodeType: 'EAN-13',
      allowBackorders: false,
      defaultLeadTimeDays: 10,
    },
    createdAt: '2026-03-05T09:00:00Z',
    updatedAt: '2026-07-21T11:00:00Z',
  },
  {
    id: 'prod_107',
    organizationId: 'org_acme_corp',
    sku: 'PHX-THERM-KIT',
    barcode: '88091234008',
    productName: 'Liquid Nitrogen Coolant System Attachment',
    description: 'Industrial grade cryogenic heat sync expansion set.',
    unit: 'SET',
    basePrice: 310.0,
    sellingPrice: 620.0,
    minimumStock: 5,
    status: 'draft',
    categoryId: 'cat_cooling',
    categoryName: 'Cryogenic & Thermal Systems',
    brandId: 'brand_quantum',
    brandName: 'Quantum Thermal',
    tags: ['Critical Spare'],
    images: [
      {
        id: 'img_107_1',
        organizationId: 'org_acme_corp',
        productId: 'prod_107',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
        isPrimary: true,
        altText: 'Cryogenic Thermal Block',
        sortOrder: 0,
        createdAt: '2026-05-10T09:45:00Z',
      },
    ],
    metadata: { minTemperature: '-196C', material: 'Oxygen-Free Copper' },
    settings: {
      allowDiscounts: true,
      isTaxable: true,
      taxRate: 10,
      trackSerialNumbers: false,
      barcodeType: 'CODE-128',
      allowBackorders: false,
      defaultLeadTimeDays: 21,
    },
    createdAt: '2026-05-10T09:45:00Z',
    updatedAt: '2026-07-10T15:30:00Z',
  },
  {
    id: 'prod_108',
    organizationId: 'org_acme_corp',
    sku: 'PHX-DISP-4K',
    barcode: '88091234009',
    productName: 'Ultra-Wide Curved Operations Monitor 34"',
    description: 'Color-accurate IPS display with built-in KVM switch and USB-C power delivery.',
    unit: 'UNIT',
    basePrice: 420.0,
    sellingPrice: 799.0,
    minimumStock: 8,
    status: 'active',
    categoryId: 'cat_displays',
    categoryName: 'Displays & Peripherals',
    brandId: 'brand_hyperion',
    brandName: 'Hyperion Displays',
    tags: ['Enterprise Only'],
    images: [
      {
        id: 'img_108_1',
        organizationId: 'org_acme_corp',
        productId: 'prod_108',
        url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80',
        isPrimary: true,
        altText: 'Ultra-Wide Curved Display',
        sortOrder: 0,
        createdAt: '2026-05-20T16:10:00Z',
      },
    ],
    metadata: { resolution: '3440 x 1440', refreshRate: '144Hz', panel: 'IPS' },
    settings: {
      allowDiscounts: true,
      isTaxable: true,
      taxRate: 10,
      trackSerialNumbers: true,
      barcodeType: 'EAN-13',
      allowBackorders: true,
      defaultLeadTimeDays: 5,
    },
    createdAt: '2026-05-20T16:10:00Z',
    updatedAt: '2026-07-24T12:00:00Z',
  },
  {
    id: 'prod_105_apex',
    organizationId: 'org_apex_retail',
    sku: 'PHX-CABLE-PRO',
    barcode: '88091234005',
    productName: 'Shielded High-Throughput Fiber Bus Cable 10m',
    description: 'Armored multi-strand optical cable for industrial equipment backbone links.',
    unit: 'PCS',
    basePrice: 18.0,
    sellingPrice: 65.0,
    minimumStock: 30,
    status: 'draft',
    categoryId: 'cat_apex_cables',
    categoryName: 'Retail Electronics & Accessories',
    brandId: 'brand_apex',
    brandName: 'Apex Pro Tech',
    tags: ['Best Seller'],
    images: [],
    metadata: { length: '10 Meters', standard: 'OS2 Single-Mode' },
    settings: {
      allowDiscounts: true,
      isTaxable: true,
      taxRate: 8,
      trackSerialNumbers: false,
      barcodeType: 'EAN-13',
      allowBackorders: false,
      defaultLeadTimeDays: 3,
    },
    createdAt: '2026-04-12T13:20:00Z',
    updatedAt: '2026-07-18T16:00:00Z',
  },
];

class ProductRepositoryImpl implements IProductRepository {
  private productsStore: Map<string, ProductRecord> = new Map();

  constructor() {
    // Populate store with initial enterprise seed
    INITIAL_PRODUCT_SEED.forEach((item) => {
      this.productsStore.set(item.id, { ...item });
    });
  }

  async getAllByOrganization(
    organizationId: string,
    filters?: Partial<ProductFilterOptions>
  ): Promise<ProductRecord[]> {
    let list = Array.from(this.productsStore.values()).filter(
      (p) => p.organizationId === organizationId && !p.deletedAt
    );

    if (filters?.status && filters.status !== 'all') {
      list = list.filter((p) => p.status === filters.status);
    }

    if (filters?.unit && filters.unit !== 'all') {
      list = list.filter((p) => p.unit === filters.unit);
    }

    if (filters?.categoryId && filters.categoryId !== 'all') {
      list = list.filter((p) => p.categoryId === filters.categoryId);
    }

    if (filters?.brandId && filters.brandId !== 'all') {
      list = list.filter((p) => p.brandId === filters.brandId);
    }

    if (filters?.tag && filters.tag !== 'all') {
      list = list.filter((p) => p.tags && p.tags.includes(filters.tag!));
    }

    if (filters?.minPrice !== undefined && filters.minPrice !== null) {
      list = list.filter((p) => p.sellingPrice >= filters.minPrice!);
    }

    if (filters?.maxPrice !== undefined && filters.maxPrice !== null) {
      list = list.filter((p) => p.sellingPrice <= filters.maxPrice!);
    }

    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase().trim().replace(/\s+/g, ' ');
      list = list.filter(
        (p) =>
          p.productName.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.barcode && p.barcode.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    return list.map((item) => ({ ...item }));
  }

  async getById(id: string, organizationId: string): Promise<ProductRecord | null> {
    const item = this.productsStore.get(id);
    if (!item || item.organizationId !== organizationId || item.deletedAt) {
      return null;
    }
    return { ...item };
  }

  async getBySku(sku: string, organizationId: string): Promise<ProductRecord | null> {
    const normalizedSku = sku.toUpperCase();
    const item = Array.from(this.productsStore.values()).find(
      (p) => p.organizationId === organizationId && p.sku === normalizedSku && !p.deletedAt
    );
    return item ? { ...item } : null;
  }

  async create(product: ProductRecord): Promise<ProductRecord> {
    this.productsStore.set(product.id, { ...product });
    return { ...product };
  }

  async update(
    id: string,
    updatedFields: Partial<ProductRecord>,
    organizationId: string
  ): Promise<ProductRecord | null> {
    const existing = await this.getById(id, organizationId);
    if (!existing) return null;

    const merged: ProductRecord = {
      ...existing,
      ...updatedFields,
      updatedAt: new Date().toISOString(),
    };

    this.productsStore.set(id, merged);
    return { ...merged };
  }

  async softDelete(id: string, organizationId: string): Promise<boolean> {
    const existing = await this.getById(id, organizationId);
    if (!existing) return false;

    existing.deletedAt = new Date().toISOString();
    existing.updatedAt = new Date().toISOString();
    this.productsStore.set(id, existing);
    return true;
  }

  async getSummary(organizationId: string): Promise<ProductSummary> {
    const products = await this.getAllByOrganization(organizationId);
    return ProductMapper.calculateSummary(products);
  }
}

export const ProductRepository = new ProductRepositoryImpl();
