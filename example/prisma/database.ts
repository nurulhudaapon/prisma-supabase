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
					/** The status of the post.
					 * - DRAFT: A draft post.
					 * - PUBLISHED: A published post
					 */
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
					/** The status of the post.
					 * - DRAFT: A draft post.
					 * - PUBLISHED: A published post
					 */
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
					/** The status of the post.
					 * - DRAFT: A draft post.
					 * - PUBLISHED: A published post
					 */
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
					/** The user's role.
					 * - USER: A regular user.
					 * - ADMIN: An administrator. Users with this role have elevated privileges within the application. Administrators can typically access all features, manage other users, and perform system-wide operations that are not available to regular users.
					 */
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
					/** The user's role.
					 * - USER: A regular user.
					 * - ADMIN: An administrator. Users with this role have elevated privileges within the application. Administrators can typically access all features, manage other users, and perform system-wide operations that are not available to regular users.
					 */
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
					/** The user's role.
					 * - USER: A regular user.
					 * - ADMIN: An administrator. Users with this role have elevated privileges within the application. Administrators can typically access all features, manage other users, and perform system-wide operations that are not available to regular users.
					 */
					role?: Database['public']['Enums']['UserRole'];
				};
				Relationships: [];
			};
			/**
			 * User View
			 *
			 * This view contains the user's role.
			 */
			UserView: {
				Row: {
					/** Make sure this gets added too
					 * - EMPTY_DOC
					 * - MULTI_EMPTY_DOC
					 * - ALT_DOC_STYLE
					 * - REGULAR_COMMENT
					 */
					emptyVariations: Database['public']['Enums']['EmptyVariations'];
					id: string;
					/**
					 * - LIST_ITEM: List item:
					 * - FORMATTED_TEXT: # Heading 1 ## Heading 2 > Blockquote
					 */
					markdownDoc: Database['public']['Enums']['MarkdownDoc'];
					/**
					 * - VALUE_1: Value 1 description
					 * - VALUE_2: Value 2 description
					 */
					memberOnlyDoc: Database['public']['Enums']['MemberOnlyDoc'];
					/**
					 * - VALUE_1: Documented value
					 * - VALUE_2
					 * - VALUE_3
					 * - VALUE_4: Doc with inline // comment
					 */
					mixedDoc: Database['public']['Enums']['MixedDoc'];
					/**
					 * - VALUE_1
					 * - VALUE_2
					 */
					noDoc: Database['public']['Enums']['NoDoc'];
					/**
					 * - VALUE_1
					 * - VALUE_2
					 */
					parentOnlyDoc: Database['public']['Enums']['ParentOnlyDoc'];
					/**
					 * - USER: A regular user.
					 * - ADMIN: An administrator. Users with this role have elevated privileges within the application. Administrators can typically access all features, manage other users, and perform system-wide operations that are not available to regular users.
					 */
					role: Database['public']['Enums']['UserRole'];
					/**
					 * - WITH_LINKS: Contains URLs: https://example.com And email: test@example.com
					 * - SPECIAL_CHARS: Contains *special* characters: @#$%^&*()_+ and émojis 🎉 ⭐️
					 * - WITH_CODE_BLOCK: ```typescript const code = 'example'; ```
					 * - WITH_FORMATTING: Contains "quotes" and 'apostrophes' And line breaks And    multiple     spaces
					 */
					specialContentDoc: Database['public']['Enums']['SpecialContentDoc'];
				};
				Insert: {
					/** Make sure this gets added too
					 * - EMPTY_DOC
					 * - MULTI_EMPTY_DOC
					 * - ALT_DOC_STYLE
					 * - REGULAR_COMMENT
					 */
					emptyVariations: Database['public']['Enums']['EmptyVariations'];
					id?: string;
					/**
					 * - LIST_ITEM: List item:
					 * - FORMATTED_TEXT: # Heading 1 ## Heading 2 > Blockquote
					 */
					markdownDoc: Database['public']['Enums']['MarkdownDoc'];
					/**
					 * - VALUE_1: Value 1 description
					 * - VALUE_2: Value 2 description
					 */
					memberOnlyDoc: Database['public']['Enums']['MemberOnlyDoc'];
					/**
					 * - VALUE_1: Documented value
					 * - VALUE_2
					 * - VALUE_3
					 * - VALUE_4: Doc with inline // comment
					 */
					mixedDoc: Database['public']['Enums']['MixedDoc'];
					/**
					 * - VALUE_1
					 * - VALUE_2
					 */
					noDoc: Database['public']['Enums']['NoDoc'];
					/**
					 * - VALUE_1
					 * - VALUE_2
					 */
					parentOnlyDoc: Database['public']['Enums']['ParentOnlyDoc'];
					/**
					 * - USER: A regular user.
					 * - ADMIN: An administrator. Users with this role have elevated privileges within the application. Administrators can typically access all features, manage other users, and perform system-wide operations that are not available to regular users.
					 */
					role: Database['public']['Enums']['UserRole'];
					/**
					 * - WITH_LINKS: Contains URLs: https://example.com And email: test@example.com
					 * - SPECIAL_CHARS: Contains *special* characters: @#$%^&*()_+ and émojis 🎉 ⭐️
					 * - WITH_CODE_BLOCK: ```typescript const code = 'example'; ```
					 * - WITH_FORMATTING: Contains "quotes" and 'apostrophes' And line breaks And    multiple     spaces
					 */
					specialContentDoc: Database['public']['Enums']['SpecialContentDoc'];
				};
				Update: {
					/** Make sure this gets added too
					 * - EMPTY_DOC
					 * - MULTI_EMPTY_DOC
					 * - ALT_DOC_STYLE
					 * - REGULAR_COMMENT
					 */
					emptyVariations?: Database['public']['Enums']['EmptyVariations'];
					id?: string;
					/**
					 * - LIST_ITEM: List item:
					 * - FORMATTED_TEXT: # Heading 1 ## Heading 2 > Blockquote
					 */
					markdownDoc?: Database['public']['Enums']['MarkdownDoc'];
					/**
					 * - VALUE_1: Value 1 description
					 * - VALUE_2: Value 2 description
					 */
					memberOnlyDoc?: Database['public']['Enums']['MemberOnlyDoc'];
					/**
					 * - VALUE_1: Documented value
					 * - VALUE_2
					 * - VALUE_3
					 * - VALUE_4: Doc with inline // comment
					 */
					mixedDoc?: Database['public']['Enums']['MixedDoc'];
					/**
					 * - VALUE_1
					 * - VALUE_2
					 */
					noDoc?: Database['public']['Enums']['NoDoc'];
					/**
					 * - VALUE_1
					 * - VALUE_2
					 */
					parentOnlyDoc?: Database['public']['Enums']['ParentOnlyDoc'];
					/**
					 * - USER: A regular user.
					 * - ADMIN: An administrator. Users with this role have elevated privileges within the application. Administrators can typically access all features, manage other users, and perform system-wide operations that are not available to regular users.
					 */
					role?: Database['public']['Enums']['UserRole'];
					/**
					 * - WITH_LINKS: Contains URLs: https://example.com And email: test@example.com
					 * - SPECIAL_CHARS: Contains *special* characters: @#$%^&*()_+ and émojis 🎉 ⭐️
					 * - WITH_CODE_BLOCK: ```typescript const code = 'example'; ```
					 * - WITH_FORMATTING: Contains "quotes" and 'apostrophes' And line breaks And    multiple     spaces
					 */
					specialContentDoc?: Database['public']['Enums']['SpecialContentDoc'];
				};
				Relationships: [];
			};
		};
		Views: {
			/* Views are within tables */
		};
		Functions: {
			/* No support for functions */
		};
		Enums: {
			/** Empty variations
			 * - EMPTY_DOC
			 * - MULTI_EMPTY_DOC
			 * - ALT_DOC_STYLE
			 * - REGULAR_COMMENT
			 */
			EmptyVariations: 'EMPTY_DOC' | 'MULTI_EMPTY_DOC' | 'ALT_DOC_STYLE' | 'REGULAR_COMMENT';
			/** Demonstrates documentation with various indentation
			 * - INDENTED_VALUE: Indented documentation Also indented More indentation
			 * - NORMAL_VALUE: Non-indented doc For comparison
			 */
			IndentationDoc: 'INDENTED_VALUE' | 'NORMAL_VALUE';
			/**
			 * Documentation with markdown formatting
			 * Demonstrates **bold**, *italic*, and `code`
			 * - First point
			 * - Second point
			 * # Heading 1
			 * ## Heading 2
			 * - LIST_ITEM: List item:
			 * - FORMATTED_TEXT: # Heading 1 ## Heading 2 > Blockquote
			 */
			MarkdownDoc: 'LIST_ITEM' | 'FORMATTED_TEXT';
			/**
			 * - VALUE_1: Value 1 description
			 * - VALUE_2: Value 2 description
			 */
			MemberOnlyDoc: 'VALUE_1' | 'VALUE_2';
			/**
			 * Mixed documentation patterns
			 * Tests various documentation combinations
			 * - VALUE_1: Documented value
			 * - VALUE_2
			 * - VALUE_3
			 * - VALUE_4: Doc with inline // comment
			 */
			MixedDoc: 'VALUE_1' | 'VALUE_2' | 'VALUE_3' | 'VALUE_4';
			/** Mixed length documentation
			 * - SHORT: Short
			 * - LONG: This is a much longer documentation string that extends beyond the typical length of a documentation comment and includes multiple lines of detailed description about the enum value
			 * - MEDIUM: Medium length With two lines
			 */
			MixedLengthDoc: 'SHORT' | 'LONG' | 'MEDIUM';
			/** No documentation at all
			 * - VALUE_1
			 * - VALUE_2
			 */
			NoDoc: 'VALUE_1' | 'VALUE_2';
			/**
			 * Parent only documentation
			 * This enum demonstrates documentation only at the enum level
			 * - VALUE_1
			 * - VALUE_2
			 */
			ParentOnlyDoc: 'VALUE_1' | 'VALUE_2';
			/**
			 * Post status
			 *
			 * This enum defines the possible statuses a post can have in the system.
			 * It is used to determine the publication status of a post.
			 * - DRAFT: A draft post.
			 * - PUBLISHED: A published post
			 */
			PostStatus: 'DRAFT' | 'PUBLISHED';
			/** Documentation with special content
			 * - WITH_LINKS: Contains URLs: https://example.com And email: test@example.com
			 * - SPECIAL_CHARS: Contains *special* characters: @#$%^&*()_+ and émojis 🎉 ⭐️
			 * - WITH_CODE_BLOCK: ```typescript const code = 'example'; ```
			 * - WITH_FORMATTING: Contains "quotes" and 'apostrophes' And line breaks And    multiple     spaces
			 */
			SpecialContentDoc: 'WITH_LINKS' | 'SPECIAL_CHARS' | 'WITH_CODE_BLOCK' | 'WITH_FORMATTING';
			/**
			 * User role
			 *
			 * This enum defines the possible roles a user can have in the system.
			 * It is used to determine the level of access and permissions for each user.
			 * - USER: A regular user.
			 * - ADMIN: An administrator. Users with this role have elevated privileges within the application. Administrators can typically access all features, manage other users, and perform system-wide operations that are not available to regular users.
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
