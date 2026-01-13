import { z } from "zod";

/**
 * Schema for validating collection query parameters.
 * Used by /api/collections endpoint (currently no params needed, but extensible).
 */
export const collectionQuerySchema = z.object({});

/**
 * Schema for validating records query parameters.
 * Used by /api/records endpoint.
 */
export const recordsQuerySchema = z.object({
  collection: z.string().min(1, "Collection name is required"),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  pageSize: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  where: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      try {
        return JSON.parse(val) as Record<string, unknown>;
      } catch {
        throw new Error("Invalid JSON in 'where' parameter");
      }
    }),
  whereDocument: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      try {
        return JSON.parse(val) as Record<string, unknown>;
      } catch {
        throw new Error("Invalid JSON in 'whereDocument' parameter");
      }
    }),
});

/**
 * Schema for validating search request body.
 * Used by /api/search endpoint.
 */
export const searchBodySchema = z.object({
  collection: z.string().min(1, "Collection name is required"),
  query: z.string().min(1, "Search query is required"),
  type: z.enum(["text", "semantic"]),
  limit: z.number().int().positive().max(100).optional().default(10),
  where: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Schema for validating metadata query parameters.
 * Used by /api/metadata endpoint.
 */
export const metadataQuerySchema = z.object({
  collection: z.string().min(1, "Collection name is required"),
});

// Type exports for convenience
export type CollectionQuery = z.infer<typeof collectionQuerySchema>;
export type RecordsQuery = z.infer<typeof recordsQuerySchema>;
export type SearchBody = z.infer<typeof searchBodySchema>;
export type MetadataQuery = z.infer<typeof metadataQuerySchema>;
