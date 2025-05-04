// src/pages/BlogPost.tsx
import React, { useState, useEffect } from 'react'; // Import React
import { useParams, Link } from 'wouter'; // Keep Link and useParams
import { Loader2 } from 'lucide-react';
// import { useTranslation } from 'react-i18next'; // Remove i18n hook
import { useForm, SubmitHandler } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar'; // Removed AvatarImage as it wasn't used
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TopNavigation } from '@/components/layout/TopNavigation'; // Assuming standalone or props based
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

// --- Dummy Data and Types ---
interface DummyUser { username: string; email?: string; role: 'user' | 'admin'; }
interface DummyComment {
    id: number | string;
    name: string;
    email?: string; // For Gravatar potentially
    content: string;
    createdAt: string; // ISO string date
    // Add user association if needed for display
    user?: { username: string } | null;
}
interface DummyBlogPost {
    id: number | string;
    slug: string;
    title: string;
    excerpt?: string | null;
    content: string; // Keep content for rendering
    coverImage?: string | null;
    category: string;
    tags?: string[];
    createdAt: string;
    viewCount?: number;
    published?: boolean; // Needed if logic depends on it
    author?: { username: string; avatarUrl?: string } | null; // Added avatarUrl possibility
    // Comments are separate
}
interface CommentFormData {
    name: string;
    email: string;
    content: string;
}

// Sample dummy data
const dummyUserData: DummyUser | null = { username: "Commenter", email: "commenter@example.com", role: "user" };
// const dummyUserData: DummyUser | null = null; // Simulate logged out

const dummyPostData: DummyBlogPost | null = {
  id: 1,
  slug: "grow-salon-social-media",
  title: "How to Grow Your Salon with Social Media",
  excerpt: "Leverage Instagram, TikTok, and Facebook to attract new clients and build your brand online.",
  content: `
# Grow Your Salon Online

Social media is vital. Here's how:

## 1. Showcase Your Work

*   **High-Quality Photos:** Use good lighting. Before & afters are great!
*   **Videos:** Short tutorials, transformations (timelapses).

## 2. Choose Platforms Wisely

*   **Instagram:** Visuals, Reels, Stories. Younger audience.
*   **Facebook:** Community, local ads, groups. Broader audience.
*   **TikTok:** Trends, quick tips, behind-the-scenes. Gen Z focus.
*   **Pinterest:** Inspiration, long-term visibility (like blog posts).

## 3. Engage!

Respond to comments & DMs quickly. Ask questions. Run polls.

\`\`\`javascript
// Example code block (if using Markdown lib)
console.log("Engage!");
\`\`\`

Visit [Our Website](https://example.com) for more tips!

- Point one
- Point two

1. Step one
2. Step two
  `,
  coverImage: "https://picsum.photos/seed/socialsalon/1200/600",
  category: "business_tips",
  tags: ["marketing", "social media", "salon growth", "instagram"],
  createdAt: "2025-05-01T09:00:00Z",
  viewCount: 980,
  published: true,
  author: { username: 'MarketingMaven' },
};

const dummyCommentsData: DummyComment[] = [
    { id: 101, name: "Alice", content: "Great tips, thanks for sharing!", createdAt: "2025-05-01T10:30:00Z", user: null },
    { id: 102, name: "Bob", content: "Very helpful, especially the platform breakdown.", createdAt: "2025-05-01T11:15:00Z", user: {username: 'BobUser'} },
    { id: 103, name: "Charlie", content: "I struggle with finding time for social media.", createdAt: "2025-05-02T14:00:00Z", user: null },
];

// Dummy translation function
const t = (key: string, options?: { count?: number }) => {
     const translations: Record<string, string> = {
        'blog.views': `view${options?.count === 1 ? '' : 's'}`,
        'blog.backToBlog': 'Back to Blog',
        'blog.tags': 'Tags',
        'blog.comments': `Comment${options?.count === 1 ? '' : 's'}`,
        'blog.addComment': 'Leave a Comment',
        'blog.commentsModerated': 'Your comment will be visible after approval.',
        'blog.name': 'Name',
        'blog.namePlaceholder': 'Your Name',
        'blog.email': 'Email',
        'blog.emailPlaceholder': 'you@example.com',
        'blog.emailPrivacy': 'Your email will not be published.',
        'blog.comment': 'Comment',
        'blog.commentPlaceholder': 'Write your comment here...',
        'blog.cancel': 'Cancel',
        'blog.submitComment': 'Submit Comment',
        'blog.commentSubmitted': 'Comment Submitted',
        'blog.commentPendingApproval': 'Thank you! Your comment is awaiting moderation.',
        'blog.commentError': 'Comment Error',
        'blog.noComments': 'No comments yet.',
        'blog.beFirstToComment': 'Be the first to share your thoughts!',
        'blog.postNotFound': 'Post Not Found',
        'blog.postNotFoundDescription': 'Sorry, we couldn\'t find the post you were looking for.',
    };
    return translations[key] || key;
};


// --- Simple Markdown Parser --- (Keep this as it's local logic)
const simpleMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return '';
  let html = markdown
    .replace(/</g, '<').replace(/>/g, '>') // Basic HTML entity escaping first
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold my-4">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold my-3">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold my-2">$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4 class="text-lg font-semibold my-1">$1</h4>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>') // Bold
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')       // Italic
    .replace(/`(.*?)`/gim, '<code class="px-1 py-0.5 bg-muted rounded text-sm">$1</code>') // Inline code
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>') // Links
    .replace(/^> (.*$)/gim, '<blockquote class="pl-4 border-l-4 border-border my-4 italic text-muted-foreground"><p>$1</p></blockquote>') // Blockquotes
    .replace(/```([\s\S]*?)```/gim, '<pre class="bg-muted p-3 rounded-md overflow-x-auto text-sm my-4"><code>$1</code></pre>') // Code blocks
    .replace(/^- (.*$)/gim, '<li>$1</li>') // Unordered list items
    .replace(/^\* (.*$)/gim, '<li>$1</li>') // Unordered list items (alternative)
    .replace(/^\d+\. (.*$)/gim, '<li>$1</li>') // Ordered list items

  // Wrap paragraphs (any line that doesn't start with a known HTML tag or list marker)
  html = html.split('\n').map(line => {
      const trimmed = line.trim();
      if (trimmed === '') return ''; // Keep empty lines maybe? Or filter out? Decide based on desired spacing.
      if (trimmed.match(/^<(h[1-4]|strong|em|code|a|blockquote|pre|li|ul|ol)/i)) {
          return line; // Don't wrap existing block/inline elements starting the line
      }
      return `<p>${line}</p>`; // Wrap other lines in <p>
  }).join('');

  // Wrap list items in <ul> or <ol> (basic wrapping, doesn't handle nesting well)
  html = html.replace(/<p><\/p>/g, ''); // Remove empty paragraphs potentially created
  html = html.replace(/(<li>.*?<\/li>)/gs, (match) => {
    // Quick check if it looks like an ordered list item marker was originally used
    // This is fragile. A real markdown parser is better.
    if (match.match(/<li.*?>\d+\./)) { // Simple check, won't work reliably
        return match; // Assume part of <ol> to be wrapped later
    }
    return match; // Assume part of <ul>
  }); // Mark potentially ordered items (fragile)

  // Wrap consecutive <li> into <ul> or <ol>
   html = html.replace(/(<li>.*?<\/li>\s*)+/gs, (match) => {
      // If any item in the block seemed ordered, wrap in <ol>
      if (match.includes('list-decimal')) { // Check if previous version added class
          return `<ol class="list-decimal pl-6 my-4 space-y-1">${match.replace(/<p>(.*?)<\/p>/g, '$1')}</ol>`; // Remove inner <p>
      }
      return `<ul class="list-disc pl-6 my-4 space-y-1">${match.replace(/<p>(.*?)<\/p>/g, '$1')}</ul>`; // Remove inner <p>
  });


  return html;
};

export default function BlogPost() {
  const { slug } = useParams<{ slug?: string }>(); // Make slug optional for safety
  // const { t } = useTranslation(); // Use dummy t function
  const { toast } = useToast();
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Use dummy data
  const user = dummyUserData;
  const isLoggedIn = !!user;
  const post = slug === dummyPostData?.slug ? dummyPostData : null; // Find post by slug in dummy data
  const comments = post ? dummyCommentsData : []; // Show dummy comments only if post matches
  const isLoadingUser = false; // Simulate loaded
  const isPostLoading = false; // Simulate loaded
  const isCommentsLoading = false; // Simulate loaded

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
    } catch (e) { return "Invalid Date"; }
  };

  // Comment form
  const form = useForm<CommentFormData>({
    // No Zod resolver
    defaultValues: {
      name: user?.username || "", // Pre-fill if user exists
      email: user?.email || "",   // Pre-fill if user exists
      content: "",
    },
    // Reset form values if user state changes (e.g., logs in/out while on page)
    // values: { name: user?.username || "", email: user?.email || "", content: "" } // RHFv7 might not need this
  });

   // Effect to reset form when user data changes (for pre-filling)
   useEffect(() => {
       form.reset({
           name: user?.username || "",
           email: user?.email || "",
           content: form.getValues().content // Keep existing message content if user logs in/out
       });
   }, [user, form]);


  // Simulate comment submission
  const onSubmit: SubmitHandler<CommentFormData> = async (data) => {
    setIsSubmittingComment(true);
    console.log("Simulating comment submission:", data);
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: t('blog.commentSubmitted'),
      description: t('blog.commentPendingApproval'),
    });
    form.reset({ name: user?.username || "", email: user?.email || "", content: "" }); // Reset with potential user defaults
    setShowCommentForm(false);
    setIsSubmittingComment(false);
    // In real app: invalidate comments query
  };

  // Show main loader if post hasn't been determined yet
  if (isPostLoading || isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Render the page structure
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopNavigation user={user} isLoggedIn={isLoggedIn} />

      {!post ? (
        // Post Not Found State
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4 text-foreground">{t('blog.postNotFound')}</h1>
          <p className="mb-8 text-muted-foreground">{t('blog.postNotFoundDescription')}</p>
          <Link href="/blog">
            <Button variant="outline" onClick={(e) => e.preventDefault()}>{t('blog.backToBlog')}</Button>
          </Link>
        </main>
      ) : (
        // Post Found State
        <main className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-3xl mx-auto bg-background p-6 sm:p-8 md:p-10 rounded-lg shadow-lg">
            {/* Breadcrumb */}
            <div className="mb-6">
              <Link href="/blog">
                 {/* Prevent default link behavior */}
                <Button variant="link" className="pl-0 text-muted-foreground hover:text-primary" onClick={(e) => e.preventDefault()}>
                  ← {t('blog.backToBlog')}
                </Button>
              </Link>
            </div>

            {/* Post Header */}
            <header className="mb-8">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3 text-sm text-muted-foreground">
                <Badge variant="secondary" className="capitalize">
                  {post.category?.replace('_', ' ') || 'Uncategorized'}
                </Badge>
                <span>{formatDate(post.createdAt)}</span>
                {post.author && <><span>•</span><span>By {post.author.username}</span></>}
                 <span>•</span>
                 <span>{post.viewCount || 0} {t('blog.views', { count: post.viewCount || 0 })}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 text-foreground leading-tight">{post.title}</h1>
              {post.excerpt && <p className="text-lg sm:text-xl text-muted-foreground">{post.excerpt}</p>}
            </header>

            {post.coverImage && (
              <div className="rounded-lg overflow-hidden mb-8 shadow-md">
                <img src={post.coverImage} alt={post.title} className="w-full h-auto object-cover"/>
              </div>
            )}

            {/* Post Content - Using dangerouslySetInnerHTML */}
            <div
              className="prose prose-lg dark:prose-invert max-w-none mb-12 prose-headings:font-semibold prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-md prose-img:shadow-md prose-code:before:content-none prose-code:after:content-none prose-code:font-normal prose-code:px-1 prose-code:py-0.5 prose-code:bg-muted prose-code:rounded"
              dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(post.content) }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mb-10">
                <h3 className="text-sm font-medium mb-2 text-muted-foreground uppercase tracking-wider">{t('blog.tags')}</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="capitalize text-sm font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator className="my-10" />

            {/* Comments Section */}
            <section id="comments">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-foreground">
                  {comments?.length || 0} {t('blog.comments', { count: comments?.length || 0 })}
                </h2>
                {!showCommentForm && (
                  <Button onClick={() => setShowCommentForm(true)} variant="outline">
                    {t('blog.addComment')}
                  </Button>
                )}
              </div>

              {/* Comment Form */}
              {showCommentForm && (
                <Card className="mb-8 shadow-sm border border-border">
                  <CardHeader>
                    <CardTitle>{t('blog.addComment')}</CardTitle>
                    <CardDescription>{t('blog.commentsModerated')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Hide Name/Email if user is logged in */}
                        {!isLoggedIn && (
                           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                             <FormField control={form.control} name="name" rules={{required: "Name is required"}} render={({ field }) => (<FormItem><FormLabel>{t('blog.name')}</FormLabel><FormControl><Input placeholder={t('blog.namePlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>)} />
                             <FormField control={form.control} name="email" rules={{required: "Email is required", pattern:{value:/^\S+@\S+$/i, message:"Invalid email"}}} render={({ field }) => (<FormItem><FormLabel>{t('blog.email')}</FormLabel><FormControl><Input type="email" placeholder={t('blog.emailPlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>)} />
                           </div>
                        )}
                         {isLoggedIn && user && (
                             <p className="text-sm text-muted-foreground">Commenting as <strong>{user.username}</strong>.</p>
                         )}
                        <FormField control={form.control} name="content" rules={{required:"Comment cannot be empty.", minLength: {value: 5, message:"Min 5 characters."}}} render={({ field }) => (<FormItem><FormLabel>{t('blog.comment')}</FormLabel><FormControl><Textarea placeholder={t('blog.commentPlaceholder')} rows={4} {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <div className="flex justify-end space-x-2 pt-2">
                          <Button type="button" variant="ghost" onClick={() => { setShowCommentForm(false); form.reset(defaultValues); }}>{t('blog.cancel')}</Button>
                          <Button type="submit" disabled={isSubmittingComment}>
                            {isSubmittingComment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('blog.submitComment')}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}

              {/* Comments List */}
              {isCommentsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : comments && comments.length > 0 ? (
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <Card key={comment.id} className="shadow-sm border border-border">
                      <CardHeader className="pb-2">
                        <div className="flex items-center space-x-3">
                          <Avatar className='h-9 w-9'>
                            <AvatarFallback className='text-sm'>
                              {comment.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{comment.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(comment.createdAt)}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 pl-[calc(0.75rem+2.25rem+0.75rem)]"> {/* Align with name */}
                        <p className="text-sm text-foreground whitespace-pre-wrap">{comment.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>{t('blog.noComments')}</p>
                  {!showCommentForm && (
                    <Button variant="link" onClick={() => setShowCommentForm(true)} className="mt-1 text-primary h-auto p-0">
                      {t('blog.beFirstToComment')}
                    </Button>
                  )}
                </div>
              )}
            </section>
          </div>
        </main>
      )}
    </div>
  );
}

// Define dummy types if needed elsewhere
interface User { username: string; email?: string; role: 'user' | 'admin'; }
interface BlogCommentType { id: number | string; name: string; email?: string; content: string; createdAt: string; user?: { username: string } | null; }
interface BlogPostType { id: number | string; slug: string; title: string; excerpt?: string | null; content: string; coverImage?: string | null; category: string; tags?: string[]; createdAt: string; viewCount?: number; published?: boolean; author?: { username: string; avatarUrl?: string } | null; }

// Define dummy schema type for comment form
interface insertBlogCommentSchema {}