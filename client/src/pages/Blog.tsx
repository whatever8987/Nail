// src/pages/Blog.tsx
import React, { useState } from 'react'; // Import React
import { Link } from 'wouter'; // Keep Link for navigation structure
import { Loader2 } from 'lucide-react';
// import { useTranslation } from 'react-i18next'; // Remove i18n for simplicity
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TopNavigation } from '@/components/layout/TopNavigation'; // Assuming standalone or props based
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

// --- Dummy Data and Types ---
interface DummyUser { username: string; email?: string; role: 'user' | 'admin'; }
interface DummyBlogPost {
  id: number | string; // Allow string for uniqueness
  slug: string;
  title: string;
  excerpt?: string | null;
  content: string; // Needed for excerpt generation
  coverImage?: string | null;
  category: string; // Use string for simplicity
  tags?: string[];
  createdAt: string; // Use ISO string date
  viewCount?: number;
  featured?: boolean;
  author?: { username: string }; // Simplified author
}

// Sample dummy data
const dummyUserData: DummyUser | null = { username: "BlogReader", role: "user" };
// const dummyUserData: DummyUser | null = null; // Simulate logged out

const dummyPostsData: DummyBlogPost[] = [
  { id: 'f1', slug: "featured-nail-trends-2025", title: "Featured: 10 Hot Nail Trends for 2025", excerpt: "Discover the styles taking over salons this year, from chrome finishes to minimalist art.", content: "The world of nail art...\n\nIs constantly evolving...", coverImage: "https://picsum.photos/seed/nailtrends/800/400", category: "trends", createdAt: "2025-04-15T10:00:00Z", viewCount: 1250, featured: true, author: { username: 'StyleGuru' } },
  { id: 1, slug: "grow-salon-social-media", title: "How to Grow Your Salon with Social Media", excerpt: "Leverage Instagram, TikTok, and Facebook to attract new clients.", content: "In today's digital age...\n\n...", coverImage: "https://picsum.photos/seed/socialsalon/600/400", category: "business_tips", createdAt: "2025-05-01T09:00:00Z", viewCount: 870, featured: false, author: { username: 'MarketingMaven' } },
  { id: 2, slug: "essential-salon-equipment", title: "Essential Equipment for New Salon Owners", excerpt: "A checklist of must-have tools and furniture.", content: "Opening a new salon...\n\n...", coverImage: "https://picsum.photos/seed/salonequip/600/400", category: "business_tips", createdAt: "2025-04-20T11:30:00Z", viewCount: 1105, featured: false, author: { username: 'Admin' } },
  { id: 3, slug: "diy-nail-care-mistakes", title: "Top 5 DIY Nail Care Mistakes to Avoid", excerpt: "Protect your nails from common at-home errors.", content: "While home manicures...\n\n...", coverImage: "https://picsum.photos/seed/nailmistakes/600/400", category: "self_care", createdAt: "2025-03-28T14:00:00Z", viewCount: 950, featured: false, author: { username: 'NailTechPro' } },
   { id: 4, slug: "spring-nail-art-ideas", title: "Fresh Spring Nail Art Ideas", excerpt: "Get inspired by floral patterns and pastel colors.", content: "Spring is in the air...\n\n...", coverImage: "https://picsum.photos/seed/springnails/600/400", category: "nail_art", createdAt: "2025-03-10T08:00:00Z", viewCount: 1500, featured: false, author: { username: 'StyleGuru' } },
];

// Categories for filter dropdown
const categories = [
  { label: "All Categories", value: "all" },
  { label: "Nail Art", value: "nail_art" },
  { label: "Business Tips", value: "business_tips" },
  { label: "Trends", value: "trends" },
  { label: "Self-Care", value: "self_care" },
  // { label: "Tutorials", value: "tutorials" }, // Add if needed
];

// Dummy translation function
const t = (key: string, options?: { count?: number }) => {
    const translations: Record<string, string> = {
        'blog.title': 'Salon Insights Blog',
        'blog.description': 'Tips, trends, and advice for salon owners and nail enthusiasts.',
        'blog.selectCategory': 'Filter by Category',
        'blog.featuredPost': 'Featured Post',
        'blog.views': `view${options?.count === 1 ? '' : 's'}`,
        'blog.readMore': 'Read More',
        'blog.noPosts': 'No posts found for this category yet.',
    };
    return translations[key] || key;
};


export default function Blog() {
  // const { t } = useTranslation(); // Use dummy t function
  const [category, setCategory] = useState("all");
  const [isLoadingPosts, setIsLoadingPosts] = useState(false); // Simulate loading

  // Use dummy user data
  const user = dummyUserData;
  const isLoggedIn = !!user;
  const isLoadingUser = false; // Simulate user loaded

  // Simulate filtering based on category state
  const filteredPosts = category === "all"
    ? dummyPostsData
    : dummyPostsData.filter(p => p.category === category);

  // Simulate loading effect when category changes
  useEffect(() => {
      setIsLoadingPosts(true);
      const timer = setTimeout(() => setIsLoadingPosts(false), 500); // Simulate fetch delay
      return () => clearTimeout(timer);
  }, [category]);

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
    } catch (e) { return "Invalid Date"; } // Handle potential invalid date strings
  };

  // Extract excerpt or create one from content
  const getExcerpt = (post: DummyBlogPost) => {
    if (post.excerpt) return post.excerpt;
    // Basic text extraction, remove markdown-like chars
    const text = post.content?.replace(/[#*_`]/g, '').split('\n').join(' ').trim() || "";
    return text.length > 150 ? text.substring(0, 147) + '...' : text;
  };

  // Combine loading states
  const isLoading = isLoadingUser || isLoadingPosts;

  if (isLoadingUser) { // Initial user load can have its own spinner maybe
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const featuredPost = filteredPosts.find(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopNavigation user={user} isLoggedIn={isLoggedIn} />

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-foreground">{t('blog.title')}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('blog.description')}
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex justify-center sm:justify-end mb-8">
            <div className="w-full sm:w-64">
              <Select
                value={category}
                onValueChange={(value) => setCategory(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('blog.selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loading State for Posts */}
          {isLoadingPosts && (
             <div className="space-y-8">
                 {/* Skeleton for Featured Post */}
                <Card className="overflow-hidden">
                    <Skeleton className="h-72 w-full bg-muted" />
                    <CardHeader>
                        <div className="flex justify-between items-center mb-2">
                           <Skeleton className="h-6 w-24" />
                           <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-full mt-2" />
                        <Skeleton className="h-4 w-5/6 mt-1" />
                    </CardHeader>
                    <CardContent>
                         <div className="flex justify-between items-center">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-9 w-24" />
                         </div>
                    </CardContent>
                </Card>
                 {/* Skeleton for Grid Posts */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array(3).fill(0).map((_, i) => (
                        <Card key={i} className="flex flex-col">
                            <Skeleton className="h-48 w-full bg-muted"/>
                            <CardHeader className="flex-grow">
                                <div className="flex justify-between items-center mb-2">
                                     <Skeleton className="h-6 w-20" />
                                     <Skeleton className="h-4 w-16" />
                                </div>
                                 <Skeleton className="h-6 w-full" />
                                 <Skeleton className="h-4 w-full mt-2" />
                                  <Skeleton className="h-4 w-4/5 mt-1" />
                            </CardHeader>
                             <CardContent>
                                <div className="flex justify-between items-center">
                                     <Skeleton className="h-5 w-14" />
                                     <Skeleton className="h-9 w-24" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
             </div>
          )}

          {/* Content when not loading posts */}
          {!isLoadingPosts && (
              <>
                  {/* Featured Post */}
                  {featuredPost && (
                    <div className="mb-12">
                      <h2 className="text-2xl font-bold mb-6 text-foreground">{t('blog.featuredPost')}</h2>
                       <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                         {featuredPost.coverImage && (
                           <div className="h-64 sm:h-72 md:h-80 overflow-hidden relative">
                             <img src={featuredPost.coverImage} alt={featuredPost.title} className="w-full h-full object-cover"/>
                             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                           </div>
                         )}
                         <div className={featuredPost.coverImage ? "p-6 bg-background relative -mt-16 z-10 m-4 rounded-lg shadow-lg backdrop-blur-sm bg-opacity-80 dark:bg-gray-900/80" : "p-6"}>
                             <div className="flex justify-between items-center mb-2 text-xs">
                               <Badge variant="secondary" className="capitalize">{categories.find(c => c.value === featuredPost.category)?.label || featuredPost.category}</Badge>
                               <span className="text-muted-foreground">{formatDate(featuredPost.createdAt)}</span>
                             </div>
                             <CardTitle className={`text-2xl mb-2 ${featuredPost.coverImage ? 'text-foreground' : ''}`}>{featuredPost.title}</CardTitle>
                             <CardDescription className={featuredPost.coverImage ? 'text-foreground/90' : ''}>{getExcerpt(featuredPost)}</CardDescription>
                             <div className="mt-4 flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">{featuredPost.viewCount} {t('blog.views', { count: featuredPost.viewCount })}</span>
                                <Link href={`/blog/${featuredPost.slug}`}>
                                     {/* Prevent default link behavior for standalone */}
                                     <Button variant="outline" onClick={(e) => e.preventDefault()}>{t('blog.readMore')}</Button>
                                </Link>
                             </div>
                         </div>
                       </Card>
                    </div>
                  )}

                  {/* Blog Post Grid */}
                  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${featuredPost ? 'pt-8 border-t' : ''}`}>
                    {regularPosts && regularPosts.length > 0 ? (
                      regularPosts.map((post) => (
                          <Card key={post.id} className="flex flex-col overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-200">
                            {post.coverImage && (
                              <div className="h-48 overflow-hidden">
                                <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover"/>
                              </div>
                            )}
                            <CardHeader className="flex-grow pb-3">
                              <div className="flex justify-between items-center mb-2 text-xs">
                                <Badge variant="outline" className="capitalize">{categories.find(c => c.value === post.category)?.label || post.category}</Badge>
                                <span className="text-muted-foreground">{formatDate(post.createdAt)}</span>
                              </div>
                              <CardTitle className="text-lg leading-tight">{post.title}</CardTitle>
                              <CardDescription className="mt-1 text-sm line-clamp-3">{getExcerpt(post)}</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-muted-foreground">{post.viewCount} {t('blog.views', { count: post.viewCount })}</span>
                                <Link href={`/blog/${post.slug}`}>
                                   {/* Prevent default link behavior */}
                                  <Button variant="link" size="sm" className="p-0 h-auto" onClick={(e) => e.preventDefault()}>{t('blog.readMore')}</Button>
                                </Link>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                    ) : (
                      <div className="col-span-full text-center py-16">
                        <p className="text-lg text-muted-foreground">{t('blog.noPosts')}</p>
                      </div>
                    )}
                  </div>
              </>
          )}
        </div>
      </main>
    </div>
  );
}

// Define dummy types if needed elsewhere
interface User { username: string; email?: string; role: 'user' | 'admin'; }
interface BlogPostType { id: number | string; slug: string; title: string; excerpt?: string | null; content: string; coverImage?: string | null; category: string; tags?: string[]; createdAt: string; viewCount?: number; featured?: boolean; author?: { username: string }; }