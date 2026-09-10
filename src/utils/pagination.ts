import type { Request } from 'express'

export interface PaginationParams {
    page: number
    limit: number
    skip: number
}

export interface PaginatedMeta {
    total_items: number
    total_pages: number
    current_page: number
    limit: number
    has_next_page: boolean
    has_prev_page: boolean
}

export interface PaginatedResponse<T> {
    data: T[]
    pagination: PaginatedMeta
}

/**
 * Parses `page` and `limit` from request query params with sensible defaults and bounds checking.
 */
export const parse_pagination_params = (
    req: Request,
    defaultLimit = 10,
    maxLimit = 100
): PaginationParams => {
    const raw_page = parseInt(req.query.page as string, 10)
    const raw_limit = parseInt(req.query.limit as string, 10)

    const page = isNaN(raw_page) || raw_page < 1 ? 1 : raw_page
    const limit = isNaN(raw_limit) || raw_limit < 1 ? defaultLimit : Math.min(raw_limit, maxLimit)
    const skip = (page - 1) * limit

    return { page, limit, skip }
}

/**
 * Builds a standardized paginated response object.
 */
export const build_paginated_response = <T>(
    data: T[],
    totalItems: number,
    page: number,
    limit: number
): PaginatedResponse<T> => {
    const total_pages = Math.ceil(totalItems / limit) || 1

    return {
        data,
        pagination: {
            total_items: totalItems,
            total_pages,
            current_page: page,
            limit,
            has_next_page: page < total_pages,
            has_prev_page: page > 1
        }
    }
}
