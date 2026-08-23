export interface Scheme {
  id: string;
  name: string;
  description: string;
  eligibility: string;
  applyLink: string;
  category: string;
}

export interface SalesItem {
  name: string;
  qtySold: number;
  price: number; // price per unit
}

export interface DailySalesEntry {
  id: string;
  date: string;
  items: SalesItem[];
  totalExpense: number;
  note?: string;
}

export interface BusinessType {
  id: string;
  name: string;
  hindiName: string;
  icon: string;
  commonItems: string[];
}

export const BUSINESS_TYPES: BusinessType[] = [
  {
    id: 'vegetable_vendor',
    name: 'Vegetable Seller',
    hindiName: 'सब्जी विक्रेता',
    icon: '🥦',
    commonItems: ['Aloo (Potato)', 'Tamatar (Tomato)', 'Pyaaz (Onion)', 'Adrak (Ginger)', 'Dhaniya (Coriander)']
  },
  {
    id: 'chai_stall',
    name: 'Chai & Snacks',
    hindiName: 'चाय और नाश्ता',
    icon: '☕',
    commonItems: ['Chai (Tea)', 'Samosa', 'Kachori', 'Biscuit', 'Bun Maska']
  },
  {
    id: 'fruit_seller',
    name: 'Fruit Seller',
    hindiName: 'फल विक्रेता',
    icon: '🍎',
    commonItems: ['Kela (Banana)', 'Seb (Apple)', 'Aam (Mango)', 'Santra (Orange)', 'Papeeta (Papaya)']
  },
  {
    id: 'fast_food',
    name: 'Fast Food Street Vendor',
    hindiName: 'फास्ट फूड विक्रेता',
    icon: '🍔',
    commonItems: ['Chowmein', 'Momo', 'Burger', 'Golgappa (Pani Puri)', 'Aloo Tikki']
  },
  {
    id: 'garments',
    name: 'Garments & Accessories',
    hindiName: 'कपड़े और सामान',
    icon: '👕',
    commonItems: ['Socks', 'T-Shirt', 'Rumal (Handkerchief)', 'Mask', 'Belt']
  },
  {
    id: 'handicrafts',
    name: 'Handicrafts & Artisan',
    hindiName: 'हस्तशिल्प और कारीगर',
    icon: '🎨',
    commonItems: ['Mitti ke Bartan (Pottery)', 'Khilona (Toy)', 'Sajaawat (Decor)', 'Churi (Bangles)', 'Thaila (Bag)']
  },
  {
    id: 'grocery',
    name: 'Grocery / Kirana',
    hindiName: 'किराना दुकान',
    icon: '🛒',
    commonItems: ['Doodh (Milk)', 'Cheeni (Sugar)', 'Chawal (Rice)', 'Aata (Flour)', 'Tel (Oil)']
  },
  {
    id: 'electronics',
    name: 'Electronics Repair',
    hindiName: 'इलेक्ट्रॉनिक्स मरम्मत',
    icon: '🔧',
    commonItems: ['Wire (तार)', 'Switch (स्विच)', 'Plug (प्लग)', 'Battery (बैटरी)', 'Bulb (बल्ब)']
  },
  {
    id: 'cosmetics',
    name: 'Cosmetics & Accessories',
    hindiName: 'सौंदर्य प्रसाधन',
    icon: '💄',
    commonItems: ['Kajal (काजल)', 'Lipstick (लिपस्टिक)', 'Bindi (बिंदी)', 'Sheesha (Mirror)', 'Kanga (Comb)']
  },
  {
    id: 'footwear',
    name: 'Footwear Seller',
    hindiName: 'जूते और चप्पल',
    icon: '👟',
    commonItems: ['Chappal (Slippers)', 'Juta (Shoes)', 'Sandal (सैंडल)', 'Polish (पॉलिश)', 'Moze (Socks)']
  },
  {
    id: 'other',
    name: 'Other / अन्य',
    hindiName: 'अन्य व्यापार',
    icon: '📦',
    commonItems: ['Item A', 'Item B', 'Item C', 'Service Fee', 'Miscellaneous']
  }
];
