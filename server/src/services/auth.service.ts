import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import config from '../config';
import type {
  AuthTokenPayload,
  UserWithoutPassword,
} from '../models/user.model';
import { User } from '@criticode/shared';

class AuthService {
  private supabase: SupabaseClient;

  constructor() {
    if (
      !config.database?.supabase?.url ||
      !config.database?.supabase?.serviceRoleKey
    ) {
      throw new Error(
        'Supabase configuration is missing. Please set SUPABASE_PROJECT_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
      );
    }

    // Use service role key for server-side operations
    this.supabase = createClient(
      config.database.supabase.url,
      config.database.supabase.serviceRoleKey
    );
  }
  /**
   * Hash a password using bcrypt with 12 rounds
   */
  async hashPassword(password: string): Promise<string> {
    try {
      const saltRounds = 12;
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Compare a plain password with a hashed password
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new Error('Failed to compare password');
    }
  }

  /**
   * Generate a JWT token with 7-day expiration
   */
  generateToken(userId: string, email: string): string {
    try {
      const payload: AuthTokenPayload = { userId, email };
      return jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
        issuer: 'code-review-backend',
        audience: 'code-review-app',
      });
    } catch (error) {
      throw new Error('Failed to generate token');
    }
  }

  /**
   * Verify and decode a JWT token
   */
  verifyToken(token: string): AuthTokenPayload {
    try {
      const decoded = jwt.verify(token, config.jwt.secret, {
        issuer: 'code-review-backend',
        audience: 'code-review-app',
      }) as AuthTokenPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw new Error('Failed to verify token');
    }
  }

  /**
   * Register a new user
   * @param email
   * @param password
   * @param fullName
   */
  async registerUser(
    email: string,
    password: string,
    fullName: string
  ): Promise<UserWithoutPassword> {
    try {
      // Validate input
      if (!email || !password || !fullName) {
        throw new Error('Email, password, and full name are required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Check if user already exists
      const existingUser = await this.findUserByEmail(email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password);

      // Create user in Supabase (let Supabase generate the ID automatically)
      const userData = {
        email: email.toLowerCase().trim(),
        full_name: fullName.trim(),
        password_hash: hashedPassword,
      };

      // Save user to Supabase
      const savedUser = await this.saveUser(userData);

      // Return user without password
      const { password: _, ...userWithoutPassword } = savedUser;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to register user');
    }
  }

  /**
   * Login a user
   */
  async loginUser(
    email: string,
    password: string
  ): Promise<{ user: UserWithoutPassword; token: string }> {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Find user by email
      const user = await this.findUserByEmail(email.toLowerCase().trim());
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Compare password
      const isPasswordValid = await this.comparePassword(
        password,
        user.password
      );
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate token
      const token = this.generateToken(user.id, user.email);

      // Return user without password and token
      const { password: _, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
        token,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to login user');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserWithoutPassword | null> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const user = await this.findUserById(userId);
      if (!user) {
        return null;
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get user');
    }
  }

  /**
   * Private helper methods for database operations
   * These will need to be implemented based on the chosen database
   */

  private async findUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null;
        }
        console.error('Supabase error finding user by email:', error);
        throw new Error('Database error while finding user');
      }

      return this.transformSupabaseUser(data);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Database error while finding user'
      ) {
        throw error;
      }
      console.error('Unexpected error finding user by email:', error);
      throw new Error('Failed to find user by email');
    }
  }

  private async findUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null;
        }
        console.error('Supabase error finding user by ID:', error);
        throw new Error('Database error while finding user');
      }

      return this.transformSupabaseUser(data);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Database error while finding user'
      ) {
        throw error;
      }
      console.error('Unexpected error finding user by ID:', error);
      throw new Error('Failed to find user by ID');
    }
  }

  private async saveUser(userData: {
    email: string;
    full_name: string;
    password_hash: string;
  }): Promise<User> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .insert([userData])
        .select('*')
        .single();

      if (error) {
        console.error('Supabase error saving user:', error);

        // Handle specific error cases
        if (error.code === '23505') {
          // Unique violation
          throw new Error('User with this email already exists');
        }

        throw new Error('Database error while creating user');
      }

      return this.transformSupabaseUser(data);
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes('already exists') ||
          error.message.includes('Database error'))
      ) {
        throw error;
      }
      console.error('Unexpected error saving user:', error);
      throw new Error('Failed to create user');
    }
  }

  /**
   * Transform Supabase user data to our User interface
   */
  private transformSupabaseUser(data: any): User {
    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      password: data.password_hash,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}

export { AuthService };

// Only create instance if not in test environment or if config is properly set
let authServiceInstance: AuthService | null = null;

try {
  if (
    process.env.NODE_ENV !== 'test' ||
    (config.database?.supabase?.url &&
      config.database?.supabase?.serviceRoleKey)
  ) {
    authServiceInstance = new AuthService();
  }
} catch (error) {
  // In test environment or if config is not available, don't create instance
  console.warn('AuthService instance not created:', error);
}

export { authServiceInstance as authService };
export default authServiceInstance;
