import { apiUrl } from "@/utils/api";
import { getToken } from "@/utils/auth";

export interface AdminBlog {
  id: string;
  title: string;
  category: string;
  slug: string;
  date: string;
  views: string;
  viewCount: number;
  description: string;
  quote: string;
  afterQuoteHeading: string;
  afterQuoteText: string;
  conclusion: string;
  imageUrl: string;
  additionalImageUrl: string;
  additionalImageTitle: string;
  additionalImageDescription: string;
  status: "draft" | "published";
  featured: boolean;
  tag: string;
  seoTitle: string;
  canonicalUrl: string;
  seoDescription: string;
  focusKeyword: string;
  seoSlug: string;
  seoSchema: string;
}

export interface BlogPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  from: number;
  to: number;
}

export interface BlogStats {
  total: number;
  published: number;
  drafts: number;
  totalViews: number;
}

export interface PublicBlog {
  id: string;
  image: string;
  date: string;
  title: string;
  slug: string;
  specialite?: string;
  tag?: string;
  viewCount: number;
  category?: string;
}

export interface PublicBlogDetail extends PublicBlog {
  description: string;
  quote: string;
  afterQuoteHeading: string;
  afterQuoteText: string;
  conclusion: string;
  additionalImageUrl: string;
  additionalImageTitle: string;
  additionalImageDescription: string;
  seo: {
    title: string;
    description: string;
    canonicalUrl: string;
    focusKeyword: string;
    schema: string;
  };
}

export function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function blogImageUrl(path: string | undefined | null): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:")) {
    return path;
  }
  if (path.startsWith("/images/")) return path;
  return apiUrl(path);
}

export function formatViewsLabel(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M Viewers`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K Viewers`;
  }
  return `${count} Viewer${count === 1 ? "" : "s"}`;
}

export interface BlogOverviewResponse {
  blogs: AdminBlog[];
  pagination: BlogPagination;
  stats: BlogStats;
  categories: string[];
}

export async function fetchBlogsOverview(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
}): Promise<BlogOverviewResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.category) query.set("category", params.category);

  const response = await fetch(apiUrl(`/api/blogs/overview?${query.toString()}`), {
    headers: authHeaders(),
    cache: "no-store",
  });
  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.message || "Failed to load blogs");
  }
  return json.data;
}

export async function fetchBlogById(id: string): Promise<AdminBlog> {
  const response = await fetch(apiUrl(`/api/blogs/${id}`), {
    headers: authHeaders(),
    cache: "no-store",
  });
  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.message || "Failed to load blog");
  }
  return json.data;
}

export async function uploadBlogImage(file: File): Promise<string> {
  const token = getToken();
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(apiUrl("/api/blogs/upload-image"), {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.message || "Image upload failed");
  }
  return json.data.url as string;
}

export interface SaveBlogPayload {
  title: string;
  category: string;
  description: string;
  quote: string;
  afterQuoteHeading: string;
  afterQuoteText: string;
  conclusion: string;
  imageUrl: string;
  additionalImageUrl: string;
  additionalImageTitle: string;
  additionalImageDescription: string;
  status: "draft" | "published";
  seoTitle: string;
  canonicalUrl: string;
  seoDescription: string;
  focusKeyword: string;
  seoSlug: string;
  seoSchema: string;
}

export async function createBlog(payload: SaveBlogPayload): Promise<AdminBlog> {
  const response = await fetch(apiUrl("/api/blogs"), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.message || "Failed to create blog");
  }
  return json.data;
}

export async function updateBlog(id: string, payload: SaveBlogPayload): Promise<AdminBlog> {
  const response = await fetch(apiUrl(`/api/blogs/${id}`), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.message || "Failed to update blog");
  }
  return json.data;
}

export async function deleteBlogById(id: string): Promise<void> {
  const response = await fetch(apiUrl(`/api/blogs/${id}`), {
    method: "DELETE",
    headers: authHeaders(),
  });
  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.message || "Failed to delete blog");
  }
}

export async function updateBlogStatus(
  id: string,
  status: "draft" | "published"
): Promise<AdminBlog> {
  const response = await fetch(apiUrl(`/api/blogs/${id}/status`), {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.message || "Failed to update blog status");
  }
  return json.data;
}

export async function updateBlogFeatured(
  id: string,
  featured: boolean
): Promise<AdminBlog> {
  const response = await fetch(apiUrl(`/api/blogs/${id}/featured`), {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ featured }),
  });
  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.message || "Failed to update featured status");
  }
  return json.data;
}

export interface PublicBlogsResponse {
  blogs: PublicBlog[];
  pagination: BlogPagination;
  categories: string[];
}

export async function fetchPublicBlogs(params: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort?: "recent" | "popular" | "all";
  featured?: boolean;
}): Promise<PublicBlogsResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", params.category);
  if (params.sort) query.set("sort", params.sort);
  if (params.featured) query.set("featured", "true");

  const response = await fetch(apiUrl(`/api/blogs/public?${query.toString()}`), {
    cache: "no-store",
  });
  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.message || "Failed to load blogs");
  }
  return json.data;
}

export async function fetchPublicBlogBySlug(slug: string): Promise<{
  blog: PublicBlogDetail;
  related: PublicBlog[];
}> {
  const response = await fetch(apiUrl(`/api/blogs/public/${encodeURIComponent(slug)}`), {
    cache: "no-store",
  });
  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.message || "Blog not found");
  }
  return json.data;
}
