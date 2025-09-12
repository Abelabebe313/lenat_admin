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
