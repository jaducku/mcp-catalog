import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { MCPServer, CreateMCPServerRequest, MCPServerSearchParams } from '@/types/mcp';
import { DatabaseRepository, DatabaseConfig, DatabaseError } from './types';

export class SupabaseRepository implements DatabaseRepository {
  private client: SupabaseClient;
  private tableName = 'mcp_servers';

  constructor(config: DatabaseConfig) {
    if (!config.supabaseUrl || !config.supabaseKey) {
      throw new DatabaseError('Supabase URL and Key are required');
    }

    this.client = createClient(config.supabaseUrl, config.supabaseKey);
  }

  async getAllServers(): Promise<MCPServer[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new DatabaseError(`Failed to fetch servers: ${error.message}`, error.code, error);
      }

      return data || [];
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(`Unexpected error fetching servers: ${error}`);
    }
  }

  async getServerById(id: string): Promise<MCPServer | null> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No rows found
        }
        throw new DatabaseError(`Failed to fetch server: ${error.message}`, error.code, error);
      }

      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(`Unexpected error fetching server: ${error}`);
    }
  }

  async createServer(data: CreateMCPServerRequest): Promise<MCPServer> {
    try {
      const serverData = {
        ...data,
        id: crypto.randomUUID(),
        status: 'unknown' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tools: [],
      };

      const { data: createdServer, error } = await this.client
        .from(this.tableName)
        .insert([serverData])
        .select()
        .single();

      if (error) {
        throw new DatabaseError(`Failed to create server: ${error.message}`, error.code, error);
      }

      return createdServer;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(`Unexpected error creating server: ${error}`);
    }
  }

  async updateServer(id: string, updates: Partial<MCPServer>): Promise<MCPServer> {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await this.client
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new DatabaseError(`Failed to update server: ${error.message}`, error.code, error);
      }

      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(`Unexpected error updating server: ${error}`);
    }
  }

  async deleteServer(id: string): Promise<void> {
    try {
      const { error } = await this.client
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        throw new DatabaseError(`Failed to delete server: ${error.message}`, error.code, error);
      }
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(`Unexpected error deleting server: ${error}`);
    }
  }

  async searchServers(params: MCPServerSearchParams): Promise<MCPServer[]> {
    try {
      let query = this.client
        .from(this.tableName)
        .select('*');

      // Search by name, description, or tags
      if (params.search) {
        query = query.or(
          `name.ilike.%${params.search}%,description.ilike.%${params.search}%,tags.cs.{${params.search}}`
        );
      }

      // Filter by type
      if (params.type) {
        query = query.eq('type', params.type);
      }

      // Filter by status
      if (params.status) {
        query = query.eq('status', params.status);
      }

      // Filter by tags
      if (params.tags && params.tags.length > 0) {
        query = query.overlaps('tags', params.tags);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw new DatabaseError(`Failed to search servers: ${error.message}`, error.code, error);
      }

      return data || [];
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(`Unexpected error searching servers: ${error}`);
    }
  }

  async ping(): Promise<boolean> {
    try {
      const { error } = await this.client
        .from(this.tableName)
        .select('id')
        .limit(1);

      return !error;
    } catch (error) {
      console.error('Database ping failed:', error);
      return false;
    }
  }
} 