import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, User, Tag, Share2, Loader2 } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const BlogPost = () => {
  const { id } = useParams();
  
  const { data: post, isLoading } = useQuery({
    queryKey: ['blog', id],
    queryFn: async () => {
      const response = await api.get(`/blog/${id}`);
      return response.data;
    },
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (!post) return null;

const blogPosts_old = [
  {
    id: 1,
    title: "How to Build a Successful Network Marketing Business",
    excerpt: "Learn the fundamental strategies that top distributors use to build their network marketing empires.",
    content: `
      <p>Building a successful network marketing business requires more than just enthusiasm and a good product. It demands strategic thinking, consistent effort, and a deep understanding of both people and business principles.</p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">1. Master Your Product Knowledge</h2>
      <p>Before you can effectively sell or promote any product, you must understand it inside and out. This means not just knowing the features, but understanding the benefits, the problems it solves, and how it compares to competitors. When you're confident in your product, that confidence translates to your prospects.</p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">2. Develop Genuine Relationships</h2>
      <p>Network marketing is fundamentally about relationships. People don't buy from strangers; they buy from people they know, like, and trust. Focus on building genuine connections rather than making quick sales. Listen to people's needs, offer value, and be helpful even when there's no immediate benefit to you.</p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">3. Create a Consistent Routine</h2>
      <p>Success in network marketing rarely happens overnight. It's the result of consistent daily actions. Create a routine that includes prospecting, follow-ups, team training, and personal development. Even 30 minutes a day of focused activity can lead to significant results over time.</p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">4. Invest in Personal Development</h2>
      <p>The person you become is more important than the techniques you learn. Successful network marketers are constantly growing, learning, and improving themselves. Read books, attend seminars, listen to podcasts, and seek mentorship from those who have achieved what you want to achieve.</p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">5. Build Your Team Strategically</h2>
      <p>Your income in network marketing is directly tied to your ability to build and develop a team. Focus on recruiting quality people who are coachable and committed, rather than just chasing numbers. Provide them with the training and support they need to succeed, and celebrate their wins along the way.</p>
      
      <p>Remember, building a successful network marketing business is a marathon, not a sprint. Stay committed to your goals, remain persistent through challenges, and always keep your focus on providing value to others.</p>
    `,
    date: "2023-06-15",
    author: "John Smith",
    tags: ["Network Marketing", "Business Tips", "Success"],
    readTime: "5 min read"
  },
  {
    id: 2,
    title: "Understanding the 14-Tier Rank System",
    excerpt: "A comprehensive guide to maximizing your earnings through our unique ranking system.",
    content: `
      <p>Our 14-tier rank system is designed to reward distributors for their growth, leadership, and contribution to the organization. Each rank comes with increasing benefits, recognition, and earning potential.</p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">The Rank Progression</h2>
      <p>The system starts with Associate and progresses through various levels including Pearl, Sapphire, Ruby, Emerald, and culminates in Diamond ranks. Each rank has specific requirements related to personal volume, team volume, and leadership achievements.</p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">Benefits at Each Level</h2>
      <p>As you advance through the ranks, you'll unlock benefits such as higher commission rates, leadership bonuses, travel incentives, and recognition events. The system is designed to reward both individual achievement and team building success.</p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">Maximizing Your Rank Potential</h2>
      <p>To advance quickly through the ranks, focus on consistent activity, team development, and leveraging the training resources available to you. Remember that rank advancement is not just about personal sales, but about building a sustainable business.</p>
    `,
    date: "2023-06-10",
    author: "Sarah Johnson",
    tags: ["Rank System", "Earnings", "Growth"],
    readTime: "7 min read"
  },
  {
    id: 3,
    title: "Top 5 Mistakes New Distributors Make",
    excerpt: "Avoid these common pitfalls that prevent new distributors from achieving success.",
    content: `
      <p>Starting a network marketing business is exciting, but new distributors often make mistakes that can hinder their success. Here are the top five mistakes to avoid:</p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">1. Not Learning the Business Model</h2>
      <p>Many new distributors jump in without fully understanding how the business works. Take time to learn the compensation plan, product knowledge, and company policies before actively promoting.</p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">2. Failing to Build a Prospect List</h2>
      <p>Successful network marketers consistently build lists of potential customers and team members. Without a steady flow of prospects, it's difficult to grow your business.</p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">3. Giving Up Too Soon</h2>
      <p>Network marketing success requires time and persistence. Many distributors quit before they have a chance to see results. Commit to the process for at least 90 days before evaluating your progress.</p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">4. Not Following Up</h2>
      <p>Follow-up is crucial in network marketing. Many opportunities are lost simply because distributors don't follow up with prospects or team members consistently.</p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">5. Trying to Do Everything Alone</h2>
      <p>Network marketing is a team sport. Take advantage of training, mentorship, and team support. Trying to figure everything out on your own will slow your progress.</p>
    `,
    date: "2023-06-05",
    author: "Michael Brown",
    tags: ["Beginners", "Mistakes", "Tips"],
    readTime: "6 min read"
  }
];



  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-secondary">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxjaXJjbGUgY3g9IjEwIiBjeT0iMTAiIHI9IjEuNSIgZmlsbD0id2hpdGUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcGF0dGVybikiLz48L3N2Zz4=')]"></div>
        </div>
        
        <div className="container mx-auto px-4 py-28 md:py-36 lg:py-44 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Button asChild variant="outline" className="mb-8">
              <Link to="/blog">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Link>
            </Button>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-primary-foreground leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center gap-4 text-primary-foreground/90">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none" 
            className="relative block w-full h-16 md:h-24"
          >
            <path 
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
              opacity=".25" 
              className="fill-white"
            ></path>
            <path 
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
              opacity=".5" 
              className="fill-white"
            ></path>
            <path 
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
              className="fill-white"
            ></path>
          </svg>
        </div>
      </div>

      {/* Blog Post Content */}
      <div className="container mx-auto px-4 py-16 relative z-10 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-xl border p-8 mb-8">
            <div className="prose prose-lg max-w-none whitespace-pre-wrap">
              {post.content}
            </div>
          </div>
          

          
          {/* Author Box */}
          <div className="bg-card rounded-xl border p-6 mt-8">
            <div className="flex items-start">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mr-4">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">{post.author}</h3>
                <p className="text-foreground mb-3">
                  About the author
                </p>
                <p className="text-foreground">
                  Experienced network marketing professional with over 10 years in the industry. 
                  Passionate about helping others achieve financial freedom through innovative business models.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of distributors who are already building their empires with Rest Empire.
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90">
            <Link to="/register">
              Create Your Account
            </Link>
          </Button>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default BlogPost;