import mockData from "./mockData.json";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const USE_MOCK_DATA =
  process.env.NEXT_PUBLIC_IS_MOCK_DATA === "true";

type ProductParams = {
  selectedPType?: string;
  selectedTag?: string;
  search?: string;
  page?: number;
  limit?: number;
};

const clone = <T,>(data: T): T => structuredClone(data);
const allItems = [...mockData.products.items, ...mockData.services.items];
const allTags = [...mockData.products.tags, ...mockData.services.tags];

function mockProducts(params: ProductParams) {
  const query = params.search?.trim().toLowerCase();
  const tag = params.selectedTag?.trim().toLowerCase();
  let items = allItems.filter((item) =>
    !params.selectedPType || item.itemType === params.selectedPType,
  );

  if (tag) {
    items = items.filter((item) =>
      item.tags.some((itemTag) => itemTag.name.toLowerCase() === tag),
    );
  }
  if (query) {
    items = items.filter((item) =>
      [item.name, item.description, ...item.industry]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }

  const start = (params.page || 0) * (params.limit || items.length);
  return {
    items: clone(items.slice(start, start + (params.limit || items.length))),
    total: items.length,
    tags: clone(allTags),
    company: mockData.products.company,
  };
}

export async function getPublicProfile(_company: string) {
  if (USE_MOCK_DATA) return clone(mockData.profile);

  const response = await fetch(`${API_BASE_URL}/api/public/profile/${_company}`);
  if (!response.ok) throw new Error("Failed to fetch profile");
  return response.json();
}

export async function getPublicProducts(company: string, params: ProductParams = {}) {
  if (USE_MOCK_DATA) return mockProducts(params);

  const queryParams = new URLSearchParams();
  if (params.selectedPType) queryParams.set("selectedPType", params.selectedPType);
  if (params.selectedTag) queryParams.set("selectedTag", params.selectedTag);
  if (params.search) queryParams.set("q", params.search);
  if (params.page) queryParams.set("page", params.page.toString());
  if (params.limit) queryParams.set("limit", params.limit.toString());
  const response = await fetch(`${API_BASE_URL}/api/public/products/${company}?${queryParams}`);
  if (!response.ok) throw new Error("Failed to fetch products");
  return response.json();
}

export async function getPublicProductById(company: string, productId: string) {
  if (USE_MOCK_DATA) {
    const item = allItems.find((candidate) => candidate.itemId === productId);
    if (!item) throw new Error("Product not found");
    return clone({ item });
  }

  const response = await fetch(`${API_BASE_URL}/api/public/products/${company}/${productId}`);
  if (!response.ok) throw new Error("Failed to fetch product");
  return response.json();
}

export async function searchProductsNearby(params: {
  lat: number;
  lng: number;
  maxRadius?: number;
  tag?: string;
  search?: string;
  industry?: string;
  country?: string;
  itemType?: string;
  limit?: number;
  skip?: number;
}) {
  if (USE_MOCK_DATA) {
    const selectedIndustries = params.industry?.split(",").filter(Boolean) || [];
    const matches = mockProducts({
      selectedPType: params.itemType,
      selectedTag: params.tag,
      search: params.search,
    }).items.filter((item) =>
      !selectedIndustries.length || item.industry.some((industry) => selectedIndustries.includes(industry)),
    );
    const skip = params.skip || 0;
    const limit = params.limit || matches.length;
    return {
      success: true,
      products: clone(matches.slice(skip, skip + limit)),
      allTags: clone(allTags),
      hasMore: skip + limit < matches.length,
    };
  }

  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") queryParams.set(key, String(value));
  });
  const response = await fetch(`${API_BASE_URL}/api/public/search/products-nearby?${queryParams}`);
  if (!response.ok) throw new Error("Failed to search products");
  return response.json();
}

export async function getAvailableCountries() {
  if (USE_MOCK_DATA) {
    return { success: true, countries: clone(mockData.availableCountries) };
  }
  const response = await fetch(`${API_BASE_URL}/api/public/search/available-countries`);
  if (!response.ok) throw new Error("Failed to fetch countries");
  return response.json();
}

export async function getAvailableIndustries(_country?: string, itemType?: string) {
  if (USE_MOCK_DATA) {
    const items = itemType ? allItems.filter((item) => item.itemType === itemType) : allItems;
    const industries = [...new Set(items.flatMap((item) => item.industry))].map((name) => {
      const definition = mockData.industries.find((industry) => industry.name === name);
      return definition || { id: name, name, icon: "🏷️", taglines: [] };
    });
    return { success: true, industries };
  }
  const queryParams = new URLSearchParams();
  if (_country) queryParams.set("country", _country);
  if (itemType) queryParams.set("itemType", itemType);
  const response = await fetch(`${API_BASE_URL}/api/public/search/available-industries?${queryParams}`);
  if (!response.ok) throw new Error("Failed to fetch industries");
  return response.json();
}

/** Full public industry catalogue supplied by the source API. */
export async function getIndustries() {
  if (USE_MOCK_DATA) return { industries: clone(mockData.industries) };

  const response = await fetch(`${API_BASE_URL}/api/public/industries`);
  if (!response.ok) throw new Error("Failed to fetch industries");
  return response.json();
}

export async function getSearchSuggestions(query: string, _country?: string) {
  if (USE_MOCK_DATA) {
    const normalizedQuery = query.toLowerCase();
    const suggestions = allItems
      .filter((item) => item.name.toLowerCase().includes(normalizedQuery))
      .map((item) => ({ name: item.name, itemType: item.itemType, itemId: item.itemId }))
      .slice(0, 8);
    return { success: true, suggestions };
  }
  const queryParams = new URLSearchParams({ q: query });
  if (_country) queryParams.set("country", _country);
  const response = await fetch(`${API_BASE_URL}/api/public/search/suggestions?${queryParams}`);
  if (!response.ok) throw new Error("Failed to fetch suggestions");
  return response.json();
}

export async function detectCountry(_lat: number, _lng: number) {
  if (USE_MOCK_DATA) return { success: true, country: clone(mockData.profile.profile.store.country) };
  const response = await fetch(`${API_BASE_URL}/api/public/search/detect-country?lat=${_lat}&lng=${_lng}`);
  if (!response.ok) throw new Error("Failed to detect country");
  return response.json();
}

export async function getCountryData() {
  if (USE_MOCK_DATA) {
    return { success: true, countryData: clone(mockData.countryData) };
  }
  const response = await fetch(`${API_BASE_URL}/api/public/search/country-data`);
  if (!response.ok) throw new Error("Failed to fetch country data");
  return response.json();
}

export async function createAppointment(data: {
  companySlug: string;
  customerPhone?: string;
  items: { itemId: string; name: string; quantity: number; price: number; currency: string }[];
  appointmentDate: string;
  appointmentTime: string;
  totalAmount: number;
}) {
  if (USE_MOCK_DATA) return { success: true, appointment: { id: crypto.randomUUID(), ...data } };
  const response = await fetch(`${API_BASE_URL}/api/public/appointments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  if (!response.ok) throw new Error("Failed to create appointment");
  return response.json();
}

export async function createChatOpsMessage(data: Record<string, unknown>) {
  if (USE_MOCK_DATA) return { success: true, message: { id: crypto.randomUUID(), ...data } };
  const response = await fetch(`${API_BASE_URL}/api/public/chatops-messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  if (!response.ok) throw new Error("Failed to send ChatOps message");
  return response.json();
}

export { API_BASE_URL, USE_MOCK_DATA };
