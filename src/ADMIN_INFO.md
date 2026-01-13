# Admin Dashboard Information

## Admin Access

The admin dashboard is restricted to **only 3 admin users** with the following email addresses:

1. `admin1@csclub.edu`
2. `admin2@csclub.edu`
3. `admin3@csclub.edu`

### How to Access the Admin Dashboard

1. **Register/Login** with one of the admin email addresses listed above
2. Once logged in, you'll see an **"Admin"** link in the navigation bar (purple color)
3. Click on the Admin link to access the admin control panel

### Admin Capabilities

The admin dashboard allows you to:

#### **Blog Management**
- ✅ Create new blog posts
- ✅ Edit existing blog posts
- ✅ Delete blog posts
- ✅ Add tags, images, and full content

#### **Event Management**
- ✅ Create new events
- ✅ Set event dates and times
- ✅ Edit event details
- ✅ Delete events
- ✅ Add event images and locations

#### **Gallery Management**
- ✅ Add new photos to the gallery
- ✅ Set photo captions and categories
- ✅ Delete photos from the gallery

### Changing Admin Emails

To modify which users have admin access, edit the file:
`/supabase/functions/server/admin.tsx`

Update the `ADMIN_EMAILS` array with your desired admin email addresses.

### Security

- Admin endpoints are protected and require authentication
- Non-admin users will see an "Access Denied" message if they try to access the admin dashboard
- All admin actions are logged in the server console
