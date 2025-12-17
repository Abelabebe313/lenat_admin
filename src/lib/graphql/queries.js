import { gql } from '@apollo/client/core'

// Query to fetch feed posts
export const GET_FEED_POSTS = gql`
  query GetFeedPosts {
    feed_posts {
      id
      category
      media_id
      state
      media {
        blur_hash
        bucket_name
        file_name
        id
        url
      }
      created_at
      updated_at
    }
  }
`

// Query to fetch users
export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      email
      phone_number
      profile {
        full_name
        gender
        media {
          url
          blur_hash
        }
        birth_date
      }
      status
    }
  }
`

// Query to fetch blog posts
export const GET_BLOG_POSTS = gql`
  query GetBlogPosts {
    blog_posts {
      id
      media {
        blur_hash
        file_name
        id
        url
      }
      state
      status
      title
      type
      updated_at
    }
  }
`

// Query to fetch trivia games
export const GET_TRIVIA_GAMES = gql`
  query GetTriviaGames {
    game_trivia {
      id
      name
      description
      state
      created_at
      updated_at
    }
  }
`

// Query to fetch trivia questions by ID
export const GET_TRIVIA_QUESTIONS = gql`
  query GetTriviaQuestions($id: uuid!) {
    game_trivia_by_pk(id: $id) {
      id
      description
      questions {
        trivia_id
        content
        answer
        options
        explanation
        id
      }
    }
  }
`

// Query to fetch marketplace products
export const GET_MARKETPLACE_PRODUCTS = gql`
  query GetMarketplaceProducts {
    marketplace_products {
      id
      name
      price
      description
      is_active
      is_featured
      product_categories {
        category_id
        category {
          name
        }
      }
      product_images {
        medium {
          url
          blur_hash
        }
      }
    }
  }
`

// Query to fetch marketplace orders
export const GET_MARKETPLACE_ORDERS = gql`
  query GetMarketplaceOrders {
    marketplace_orders {
      id
      items {
        order_id
        product_id
        product {
          id
          name
          price
          state
          user_id
          description
        }
        quantity
      }
      state
      created_at
      updated_at
    }
  }
`

// Query to get presigned URL for feed post image upload
export const GET_STORAGE_FEED_POST_URL = gql`
  query GetStorageFeedPostUrl($file_name: String!, $object_id: String!) {
    storage_feed_upload(file_name: $file_name, object_id: $object_id) {
      url
    }
  }
`

// Query to get presigned URL for blog post image upload
export const GET_STORAGE_BLOG_POST_URL = gql`
  query GetStorageBlogPostUrl($file_name: String!, $object_id: String!) {
    storage_blog_upload(file_name: $file_name, object_id: $object_id) {
      url
    }
  }
`

// Query to get presigned URL for marketplace product image upload
export const GET_STORAGE_MARKETPLACE_PRODUCT_URL = gql`
  query GetStorageMarketplaceProductUrl($file_name: String!, $object_id: String!) {
    storage_product_upload(file_name: $file_name, object_id: $object_id) {
      url
    }
  }
`
