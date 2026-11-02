
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "categories": {
                  Row: {
                    "active": boolean,"id": number,"name": string,"slug": string
                  }
                  ComputedFields: never
                  Insert: {
                    "active"?: boolean,"id"?: number,"name": string,"slug": string
                  }
                  Update: {
                    "active"?: boolean,"id"?: number,"name"?: string,"slug"?: string
                  }
                  Relationships: [
                    
                  ]
                },"provider_categories": {
                  Row: {
                    "category_id": number,"provider_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "category_id": number,"provider_id": string
                  }
                  Update: {
                    "category_id"?: number,"provider_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "provider_categories_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "provider_categories_provider_id_fkey"
      columns: ["provider_id"]
isOneToOne: false
      referencedRelation: "providers"
      referencedColumns: ["id"]
    }
                  ]
                },"providers": {
                  Row: {
                    "bio": string | null,"busy": boolean,"busy_reminder_sent_at": string | null,"busy_updated_at": string,"city": string | null,"created_at": string,"hidden": boolean,"id": string,"location": unknown,"name": string,"neighborhood": string | null,"whatsapp": string,"whatsapp_consent_at": string,"years_experience": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "bio"?: string | null,"busy"?: boolean,"busy_reminder_sent_at"?: string | null,"busy_updated_at"?: string,"city"?: string | null,"created_at"?: string,"hidden"?: boolean,"id"?: string,"location": unknown,"name": string,"neighborhood"?: string | null,"whatsapp": string,"whatsapp_consent_at": string,"years_experience"?: number | null
                  }
                  Update: {
                    "bio"?: string | null,"busy"?: boolean,"busy_reminder_sent_at"?: string | null,"busy_updated_at"?: string,"city"?: string | null,"created_at"?: string,"hidden"?: boolean,"id"?: string,"location"?: unknown,"name"?: string,"neighborhood"?: string | null,"whatsapp"?: string,"whatsapp_consent_at"?: string,"years_experience"?: number | null
                  }
                  Relationships: [
                    
                  ]
                },"rate_limit_hits": {
                  Row: {
                    "created_at": string,"id": number,"key": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: number,"key": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: number,"key"?: string
                  }
                  Relationships: [
                    
                  ]
                },"recommendations": {
                  Row: {
                    "client_name": string,"client_phone": string,"comment": string | null,"created_at": string,"highlights": (string)[],"id": string,"provider_id": string,"service_request_id": string,"visible": boolean
                  }
                  ComputedFields: never
                  Insert: {
                    "client_name": string,"client_phone": string,"comment"?: string | null,"created_at"?: string,"highlights"?: (string)[],"id"?: string,"provider_id": string,"service_request_id": string,"visible"?: boolean
                  }
                  Update: {
                    "client_name"?: string,"client_phone"?: string,"comment"?: string | null,"created_at"?: string,"highlights"?: (string)[],"id"?: string,"provider_id"?: string,"service_request_id"?: string,"visible"?: boolean
                  }
                  Relationships: [
                    {
      foreignKeyName: "recommendations_provider_id_fkey"
      columns: ["provider_id"]
isOneToOne: false
      referencedRelation: "providers"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "recommendations_service_request_id_fkey"
      columns: ["service_request_id"]
isOneToOne: true
      referencedRelation: "service_requests"
      referencedColumns: ["id"]
    }
                  ]
                },"service_requests": {
                  Row: {
                    "accepted_at": string | null,"anonymous_client": string | null,"cancelled_at": string | null,"category_id": number,"client_confirmed_at": string | null,"client_name": string,"client_phone": string | null,"client_token": string | null,"completed_at": string | null,"completed_by": string | null,"created_at": string,"details": string,"distance_km": number | null,"expired_at": string | null,"id": string,"provider_id": string,"provider_token": string,"status": string
                  }
                  ComputedFields: never
                  Insert: {
                    "accepted_at"?: string | null,"anonymous_client"?: string | null,"cancelled_at"?: string | null,"category_id": number,"client_confirmed_at"?: string | null,"client_name": string,"client_phone"?: string | null,"client_token"?: string | null,"completed_at"?: string | null,"completed_by"?: string | null,"created_at"?: string,"details": string,"distance_km"?: number | null,"expired_at"?: string | null,"id"?: string,"provider_id": string,"provider_token": string,"status"?: string
                  }
                  Update: {
                    "accepted_at"?: string | null,"anonymous_client"?: string | null,"cancelled_at"?: string | null,"category_id"?: number,"client_confirmed_at"?: string | null,"client_name"?: string,"client_phone"?: string | null,"client_token"?: string | null,"completed_at"?: string | null,"completed_by"?: string | null,"created_at"?: string,"details"?: string,"distance_km"?: number | null,"expired_at"?: string | null,"id"?: string,"provider_id"?: string,"provider_token"?: string,"status"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "service_requests_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "service_requests_provider_id_fkey"
      columns: ["provider_id"]
isOneToOne: false
      referencedRelation: "providers"
      referencedColumns: ["id"]
    }
                  ]
                },"sessions": {
                  Row: {
                    "created_at": string,"expires_at": string,"id": string,"phone": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"expires_at": string,"id"?: string,"phone": string
                  }
                  Update: {
                    "created_at"?: string,"expires_at"?: string,"id"?: string,"phone"?: string
                  }
                  Relationships: [
                    
                  ]
                },"verifications": {
                  Row: {
                    "code": string,"confirmed_at": string | null,"created_at": string,"expires_at": string,"id": string,"phone": string | null,"used_at": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "code": string,"confirmed_at"?: string | null,"created_at"?: string,"expires_at": string,"id"?: string,"phone"?: string | null,"used_at"?: string | null
                  }
                  Update: {
                    "code"?: string,"confirmed_at"?: string | null,"created_at"?: string,"expires_at"?: string,"id"?: string,"phone"?: string | null,"used_at"?: string | null
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "assert_valid_coordinates":
{ Args: { "p_lat": number,"p_lng": number }; Returns: undefined
                           },
"coarse_point":
{ Args: { "p_lat": number,"p_lng": number }; Returns: unknown
                           },
"create_provider":
{ Args: { "p_category_ids"?: (number)[],"p_city"?: string,"p_lat": number,"p_lng": number,"p_name": string,"p_neighborhood"?: string,"p_whatsapp": string }; Returns: string
                           },
"distance_to_provider":
{ Args: { "p_lat": number,"p_lng": number,"p_provider_id": string }; Returns: number
                           },
"search_providers":
{ Args: { "p_category_id": number,"p_lat": number,"p_lng": number,"p_radius_km": number }; Returns: {
              "busy": boolean,"categories": (string)[],"distance_km": number,"id": string,"name": string,"neighborhood": string,"recommendation_count": number
            }[]
                           },
"set_provider_location":
{ Args: { "p_city"?: string,"p_lat": number,"p_lng": number,"p_neighborhood"?: string,"p_provider_id": string }; Returns: undefined
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const
