// User types
export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: 'ADMIN' | 'SALES' | 'OPS';
    phone?: string;
}

// Customer types
export interface Customer {
    id: number;
    type: 'INDIVIDUAL' | 'COMPANY';
    name: string;
    phone: string;
    email: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    contacts?: Contact[];
    addresses?: Address[];
    contacts_count?: number;
}

export interface Contact {
    id: number;
    customer: number;
    name: string;
    phone: string;
    email: string;
    role_title: string;
}

export interface Address {
    id: number;
    customer: number;
    label: string;
    city: string;
    zone: string;
    details: string;
    lat?: number;
    lng?: number;
}

// Lead types
export interface Lead {
    id: number;
    customer?: number;
    customer_name?: string;
    name: string;
    phone: string;
    email?: string;
    source: 'WEB' | 'IG' | 'WHATSAPP' | 'REFERRAL' | 'OTHER';
    source_display?: string;
    status: 'NEW' | 'QUALIFIED' | 'DISQUALIFIED' | 'CONVERTED';
    status_display?: string;
    notes?: string;
    created_at: string;
}

// Opportunity types
export type OpportunityStage = 'NEW' | 'CONTACTED' | 'VISIT_SCHEDULED' | 'QUOTE_SENT' | 'NEGOTIATION' | 'WON' | 'LOST';

export interface Opportunity {
    id: number;
    customer: number;
    customer_name: string;
    title: string;
    stage: OpportunityStage;
    stage_display?: string;
    value_estimate: number;
    close_date?: string;
    assigned_to?: number;
    assigned_to_email?: string;
    notes?: string;
    created_at: string;
}

// Activity types
export interface Activity {
    id: number;
    type: 'CALL' | 'WHATSAPP' | 'EMAIL' | 'VISIT' | 'TASK';
    type_display?: string;
    notes: string;
    due_at?: string;
    done_at?: string;
    customer?: number;
    customer_name?: string;
    opportunity?: number;
    opportunity_title?: string;
    is_done: boolean;
}

// Quote types
export interface Quote {
    id: number;
    customer: number;
    customer_name: string;
    opportunity?: number;
    opportunity_title?: string;
    status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';
    status_display?: string;
    total: number;
    valid_until?: string;
    notes?: string;
    created_at: string;
    items?: QuoteItem[];
    items_count?: number;
}

export interface QuoteItem {
    id?: number;
    quote?: number;
    item_type: 'PRODUCT' | 'SERVICE';
    name: string;
    description?: string;
    qty: number;
    unit_price: number;
    line_total?: number;
}

// Project types
export interface Project {
    id: number;
    customer: number;
    customer_name: string;
    quote?: number;
    quote_number?: string;
    title: string;
    status: 'PLANNING' | 'IN_PROGRESS' | 'DONE' | 'MAINTENANCE';
    status_display?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
    created_at: string;
    media?: ProjectMedia[];
    media_count?: number;
}

export interface ProjectMedia {
    id: number;
    project: number;
    media_type: 'BEFORE' | 'AFTER' | 'PROGRESS';
    media_type_display?: string;
    url: string;
    caption?: string;
}

// Catalog types
export interface CatalogItem {
    id: number;
    type: 'PRODUCT' | 'SERVICE';
    type_display?: string;
    name: string;
    description?: string;
    category: string;
    price_ref: number;
    active: boolean;
}

// Dashboard stats
export interface DashboardStats {
    leads: {
        new: number;
        qualified: number;
    };
    opportunities_by_stage: Record<OpportunityStage, number>;
    total_pipeline_value: number;
    quotes: {
        draft: number;
        sent: number;
    };
    activities_pending: number;
}

// API response types
export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface TokenResponse {
    access: string;
    refresh: string;
}

export interface ImportResponse {
    created: number;
    errors: string[];
}
