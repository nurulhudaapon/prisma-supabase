export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
	public: {
		Tables: {
			/**
			 * Post
			 *
			 * This model represents a blog post or article in the system.
			 * It contains information about each post, including its unique identifier,
			 * title, content, publication status, and the author who wrote it.
			 */
			Post: {
				Row: {
					/** The user who wrote the post. */
					authorId: string;
					/**
					 * The content of the post.
					 * This optional field contains the main body or text of the blog post.
					 * It can store formatted text, allowing for rich content including
					 * paragraphs, headings, lists, and potentially embedded media.
					 */
					content: string | null;
					/** The unique identifier for the post. */
					id: string;
					/** Whether the post is published. */
					published: boolean;
					/** The status of the post. */
					status: Database['public']['Enums']['PostStatus'];
					/** The title of the post. */
					title: string;
				};
				Insert: {
					/** The user who wrote the post. */
					authorId: string;
					/**
					 * The content of the post.
					 * This optional field contains the main body or text of the blog post.
					 * It can store formatted text, allowing for rich content including
					 * paragraphs, headings, lists, and potentially embedded media.
					 */
					content?: string | null;
					/** The unique identifier for the post. */
					id?: string;
					/** Whether the post is published. */
					published?: boolean;
					/** The status of the post. */
					status?: Database['public']['Enums']['PostStatus'];
					/** The title of the post. */
					title: string;
				};
				Update: {
					/** The user who wrote the post. */
					authorId?: string;
					/**
					 * The content of the post.
					 * This optional field contains the main body or text of the blog post.
					 * It can store formatted text, allowing for rich content including
					 * paragraphs, headings, lists, and potentially embedded media.
					 */
					content?: string | null;
					/** The unique identifier for the post. */
					id?: string;
					/** Whether the post is published. */
					published?: boolean;
					/** The status of the post. */
					status?: Database['public']['Enums']['PostStatus'];
					/** The title of the post. */
					title?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'PostToUser';
						columns: ['authorId'];
						isOneToOne: false;
						referencedRelation: 'User';
						referencedColumns: ['id'];
					},
				];
			};

			/**
			 * User
			 *
			 * This model represents a user in the system.
			 * It stores essential information about each user, including their unique identifier,
			 * email address, name, role, and associated posts.
			 * Users can have multiple posts and are assigned a specific role (USER or ADMIN).
			 */
			User: {
				Row: {
					/** The user's email address. */
					email: string;
					/**
					 * The unique identifier for the user.
					 * This UUID is automatically generated when a new user is created.
					 * It serves as the primary key for the User model and is used to
					 * establish relationships with other models, such as Post.
					 */
					id: string;
					/** The user's name. */
					name: string | null;
					/** The user's role. */
					role: Database['public']['Enums']['UserRole'];
				};
				Insert: {
					/** The user's email address. */
					email: string;
					/**
					 * The unique identifier for the user.
					 * This UUID is automatically generated when a new user is created.
					 * It serves as the primary key for the User model and is used to
					 * establish relationships with other models, such as Post.
					 */
					id?: string;
					/** The user's name. */
					name?: string | null;
					/** The user's role. */
					role?: Database['public']['Enums']['UserRole'];
				};
				Update: {
					/** The user's email address. */
					email?: string;
					/**
					 * The unique identifier for the user.
					 * This UUID is automatically generated when a new user is created.
					 * It serves as the primary key for the User model and is used to
					 * establish relationships with other models, such as Post.
					 */
					id?: string;
					/** The user's name. */
					name?: string | null;
					/** The user's role. */
					role?: Database['public']['Enums']['UserRole'];
				};
				Relationships: [];
			};
		};
		Views: {
			/* No support for views */
		};
		Functions: {
			/* No support for functions */
		};
		Enums: {
			/**
			 * Post status
			 *
			 * This enum defines the possible statuses a post can have in the system.
			 * It is used to determine the publication status of a post.
			 * @member **DRAFT**: A draft post.
			 * @member **PUBLISHED**: A published post
			 */
			PostStatus: 'DRAFT' | 'PUBLISHED';
			/**
			 * User role
			 *
			 * This enum defines the possible roles a user can have in the system.
			 * It is used to determine the level of access and permissions for each user.
			 * @member **USER**: A regular user.
			 * @member **ADMIN**: An administrator. Users with this role have elevated privileges within the application. Administrators can typically access all features, manage other users, and perform system-wide operations that are not available to regular users.
			 */
			UserRole: 'USER' | 'ADMIN';
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
	PublicTableNameOrOptions extends
		| keyof (PublicSchema['Tables'] & PublicSchema['Views'])
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
				Database[PublicTableNameOrOptions['schema']]['Views'])
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
			Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
		? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema['Tables']
		? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema['Tables']
		? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] | { schema: keyof Database },
	EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
		: never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
	? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
	: PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
		? PublicSchema['Enums'][PublicEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes'] | { schema: keyof Database },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
		: never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
	? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
		? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
		: never;
