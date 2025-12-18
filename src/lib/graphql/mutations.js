import { gql } from '@apollo/client/core'

// Mutation to request OTP
export const AUTH_OTP = gql`
  mutation AuthOtp($value: String!) {
    auth_otp(value: $value) {
      message
    }
  }
`

// Mutation to verify OTP and get tokens
export const AUTH_OTP_CALLBACK = gql`
  mutation AuthOtpCallback($code: String!, $value: String!) {
    auth_otp_callback(code: $code, value: $value) {
      access_token
      refresh_token
      id
      email
      new_user
      phone_number
      role
    }
  }
`

// Mutation to refresh access token
export const REFRESH_TOKEN = gql`
  mutation RefreshToken($refresh_token: String!) {
    auth_refresh_tokens(refresh_token: $refresh_token) {
      access_token
      refresh_token
    }
  }
`

// Mutation to update trivia question
export const UPDATE_TRIVIA_QUESTION = gql`
  mutation UpdateTriviaQuestion($id: uuid!, $content: String!, $answer: String!, $options: jsonb!) {
    update_game_trivia_questions_by_pk(
      pk_columns: { id: $id }
      _set: { 
        content: $content
        answer: $answer
        options: $options
      }
    ) {
      id
      content
      answer
      options
    }
  }
`

// Mutation to delete trivia question
export const DELETE_TRIVIA_QUESTION = gql`
  mutation DeleteTriviaQuestion($id: uuid!) {
    delete_game_trivia_questions_by_pk(id: $id) {
      id
    }
  }
`

// Mutation to delete trivia (with cascade delete for questions)
export const DELETE_TRIVIA = gql`
  mutation DeleteTrivia($id: uuid!) {
    delete_game_trivia_by_pk(id: $id) {
      id
      description
      name
      state
    }
  }
`

// Mutation to delete trivia questions first, then trivia
export const DELETE_TRIVIA_WITH_QUESTIONS = gql`
  mutation DeleteTriviaWithQuestions($triviaId: uuid!) {
    # First delete all questions for this trivia
    delete_game_trivia_questions(where: { trivia_id: { _eq: $triviaId } }) {
      affected_rows
    }
    # Then delete the trivia
    delete_game_trivia_by_pk(id: $triviaId) {
      id
      description
      name
      state
    }
  }
`

// Mutation to insert new trivia
export const INSERT_TRIVIA = gql`
  mutation InsertTrivia($trivia: game_trivia_insert_input!) {
    insert_game_trivia_one(object: $trivia) {
      id
      name
      index
      state
      description
      user_id
      created_at
      updated_at
    }
  }
`

// Mutation to create a feed post
export const CREATE_ONE_POST_FEED = gql`
  mutation CreateOnePostFeed($description: String, $user_id: uuid!, $category: enum_feed_type_enum, $state: enum_generic_state_enum = Accepted) {
    insert_feed_posts_one(object: {description: $description, user_id: $user_id, category: $category, state: $state}) {
      id
    }
  }
`

// Mutation to delete a feed post
export const DELETE_FEED_POST = gql`
  mutation DeleteFeedPost($id: uuid!) {
    delete_feed_posts_by_pk(id: $id) {
      id
    }
  }
`

// Mutation to create a blog post
export const CREATE_ONE_BLOG_POST = gql`
  mutation CreateOneBlogPost($user_id: uuid!, $state: enum_generic_state_enum = Accepted, $title: String, $content: String, $type: enum_blog_type_enum) {
    insert_blog_posts_one(object: {user_id: $user_id, state: $state, title: $title, content: $content, type: $type}) {
      id
      status
    }
  }
`

// Mutation to delete a blog post
export const DELETE_BLOG_POST = gql`
  mutation DeleteBlogPost($id: uuid!) {
    delete_blog_posts_by_pk(id: $id) {
      id
    }
  }
`

// Mutation to create a marketplace product
export const CREATE_MARKETPLACE_PRODUCT = gql`
  mutation CreateProduct($name: String!, $price: numeric!, $description: String, $is_active: Boolean, $is_featured: Boolean, $user_id: uuid!, $categories: [marketplace_product_categories_insert_input!]!) {
    insert_marketplace_products_one(
      object: {
        name: $name
        price: $price
        description: $description
        is_active: $is_active
        is_featured: $is_featured
        user_id: $user_id
        product_categories: {
          data: $categories
        }
      }
    ) {
      id
      name
      price
      description
      is_active
      is_featured
      user_id
      product_categories {
        category_id
        category {
          name
        }
      }
    }
  }
`

// Mutation to update a marketplace product
export const UPDATE_MARKETPLACE_PRODUCT = gql`
  mutation UpdateProduct($id: uuid!, $name: String, $price: numeric, $description: String, $is_active: Boolean, $is_featured: Boolean) {
    update_marketplace_products_by_pk(
      pk_columns: { id: $id }
      _set: {
        name: $name
        price: $price
        description: $description
        is_active: $is_active
        is_featured: $is_featured
      }
    ) {
      id
      name
      price
      description
      is_active
      is_featured
    }
  }
`

// Mutation to delete a marketplace product
export const DELETE_MARKETPLACE_PRODUCT = gql`
  mutation DeleteProduct($id: uuid!) {
    # First delete related product categories
    delete_marketplace_product_categories(where: {product_id: {_eq: $id}}) {
      affected_rows
    }
    # Then delete the product
    delete_marketplace_products_by_pk(id: $id) {
      id
    }
  }
`
