import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";

// YouTube embed component for articles
const YouTubeEmbed = ({ videoId }: { videoId: string }) => (
  <div className="relative w-full aspect-video rounded overflow-hidden my-4 border border-border">
    <iframe
      src={`https://www.youtube.com/embed/${videoId}`}
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="absolute top-0 left-0 w-full h-full"
    />
  </div>
);

// Article column data - unique articles for each column
const articleColumns = [
  {
    id: 1,
    direction: "down" as const,
    articles: [
      {
        category: "Politics",
        categoryColor: "secondary" as const,
        title: "Senate Committee Advances Landmark Infrastructure Bill",
        author: "Margaret Chen",
        content: [
          "After months of negotiations, bipartisan support emerges for comprehensive infrastructure package aimed at modernizing transportation networks and creating thousands of new jobs across the country.",
          "The legislation, which has been years in the making, represents one of the most significant investments in America's infrastructure since the Interstate Highway System.",
          "Key provisions include funding for roads, bridges, broadband expansion, and climate resilience initiatives. Economists predict substantial long-term economic benefits from the modernization efforts."
        ],
        minHeight: "500px"
      },
      {
        category: "Technology",
        categoryColor: "secondary" as const,
        title: "Tech Giants Face New Regulatory Scrutiny",
        author: "David Park",
        content: [
          "Lawmakers propose sweeping changes to digital privacy laws as concerns mount over data collection practices and market dominance of major technology companies.",
          "The proposed regulations would fundamentally reshape how tech companies operate, introducing strict requirements for data transparency and user consent."
        ],
        minHeight: "350px"
      },
      {
        category: "Technology",
        categoryColor: "accent" as const,
        title: "Revolutionary AI Model Transforms Creative Industries",
        author: "Alex Thompson",
        content: [
          "A groundbreaking artificial intelligence system is reshaping how creative professionals work, offering unprecedented capabilities in content generation and design assistance.",
          "Industry experts demonstrate the technology's potential in this exclusive presentation, showcasing real-world applications across multiple creative fields."
        ],
        videoId: "dQw4w9WgXcQ",
        minHeight: "550px"
      },
      {
        category: "Local",
        categoryColor: "secondary" as const,
        title: "City Council Approves New Park Development",
        author: "Local Desk",
        content: [
          "Downtown expansion includes green spaces and community centers in ambitious urban renewal project that aims to bring nature back to the city's core.",
          "The development will feature walking trails, playgrounds, and public art installations designed by local artists."
        ],
        minHeight: "300px"
      }
    ]
  },
  {
    id: 2,
    direction: "up" as const,
    articles: [
      {
        category: "Breaking",
        categoryColor: "accent" as const,
        title: "Historic Climate Accord Signed by 150 Nations",
        author: "Elena Rodriguez",
        content: [
          "World leaders convene to commit to ambitious emissions targets in effort to combat accelerating environmental changes. The landmark agreement represents a pivotal moment in international cooperation.",
          "Scientists and environmental advocates have praised the comprehensive nature of the accord, which includes binding commitments for carbon reduction, renewable energy adoption, and financial support for developing nations.",
          "The agreement comes after intensive negotiations spanning multiple continents and represents a unified global response to the climate crisis that has been decades in the making.",
          "Implementation begins next quarter with initial reporting requirements and verification mechanisms to ensure compliance across all participating nations."
        ],
        minHeight: "600px"
      },
      {
        category: "Business",
        categoryColor: "secondary" as const,
        title: "Startup Valuations Soar Despite Market Volatility",
        author: "Robert Kim",
        content: [
          "Venture capital continues flowing to promising tech ventures as investors bet on post-pandemic innovation boom and transformative technologies.",
          "Industry analysts point to artificial intelligence, biotechnology, and sustainable energy sectors as driving forces behind unprecedented investment activity."
        ],
        minHeight: "350px"
      },
      {
        category: "Economy",
        categoryColor: "secondary" as const,
        title: "Federal Reserve Signals Potential Rate Changes",
        author: "Sarah Williams",
        content: [
          "Economic indicators prompt discussions about monetary policy adjustments as officials balance growth concerns with inflation pressures.",
          "Market analysts are closely watching upcoming statements for clues about the central bank's strategy in navigating current economic conditions."
        ],
        minHeight: "300px"
      }
    ]
  },
  {
    id: 3,
    direction: "down" as const,
    articles: [
      {
        category: "Science",
        categoryColor: "secondary" as const,
        title: "Breakthrough in Quantum Computing Research",
        author: "Dr. Lisa Wang",
        content: [
          "Researchers achieve major milestone in quantum error correction, bringing practical quantum computers closer to reality than ever before.",
          "The breakthrough could revolutionize fields from drug discovery to cryptography, solving problems that are currently impossible for classical computers.",
          "Leading tech companies are already racing to commercialize the technology, with experts predicting widespread applications within the next decade."
        ],
        minHeight: "450px"
      },
      {
        category: "Health",
        categoryColor: "secondary" as const,
        title: "New Medical Study Reveals Promising Treatment",
        author: "Dr. James Mitchell",
        content: [
          "Clinical trials show remarkable results for novel therapy targeting previously untreatable conditions, offering hope to millions of patients worldwide.",
          "The treatment has shown minimal side effects while demonstrating significant efficacy across diverse patient populations."
        ],
        minHeight: "350px"
      },
      {
        category: "Education",
        categoryColor: "secondary" as const,
        title: "Universities Embrace Hybrid Learning Models",
        author: "Amanda Foster",
        content: [
          "Educational institutions worldwide adapt to changing student needs by combining traditional classroom instruction with innovative digital platforms.",
          "Early results suggest improved student engagement and learning outcomes across multiple disciplines."
        ],
        minHeight: "300px"
      }
    ]
  },
  {
    id: 4,
    direction: "up" as const,
    articles: [
      {
        category: "Sports",
        categoryColor: "secondary" as const,
        title: "Underdog Team Clinches Championship Title",
        author: "Marcus Thompson",
        content: [
          "In a stunning upset, the season's lowest-ranked team defeats defending champions in dramatic finale that will be remembered for generations.",
          "The victory came down to the final seconds, with spectacular plays from previously unknown athletes who rose to the occasion when it mattered most.",
          "Fans flooded the streets in celebration as the city experienced its first championship win in over three decades, marking a historic moment for the franchise.",
          "Team management credits the success to a combination of strategic coaching decisions, player development, and unwavering community support throughout the challenging season."
        ],
        minHeight: "600px"
      },
      {
        category: "Entertainment",
        categoryColor: "secondary" as const,
        title: "Record-Breaking Film Dominates Box Office",
        author: "Jessica Martinez",
        content: [
          "Latest blockbuster shatters opening weekend records, demonstrating continued appetite for theatrical experiences despite streaming competition.",
          "Critics praise the film's innovative storytelling and groundbreaking visual effects that push the boundaries of cinema."
        ],
        minHeight: "350px"
      },
      {
        category: "Culture",
        categoryColor: "secondary" as const,
        title: "Museum Unveils Rare Historical Collection",
        author: "Thomas Anderson",
        content: [
          "Previously unseen artifacts from ancient civilization go on public display, offering new insights into historical mysteries that have puzzled scholars for centuries.",
          "The exhibition features interactive elements that bring history to life for visitors of all ages."
        ],
        minHeight: "300px"
      }
    ]
  }
];

const Index = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedArticle, setHighlightedArticle] = useState<string | null>(null);
  const [pausedColumns, setPausedColumns] = useState<Set<number>>(new Set());
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const columnsPerPage = 2;
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isWheeling = useRef(false);
  
  // Generate search suggestions based on query
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const allArticles = articleColumns.flatMap((col, colIdx) => 
      col.articles.map((article, artIdx) => ({
        ...article,
        columnId: col.id,
        columnIndex: colIdx,
        articleIndex: artIdx,
        uniqueId: `${col.id}-${artIdx}`
      }))
    );
    
    const matches = allArticles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    return matches.slice(0, 5);
  }, [searchQuery]);
  
  const totalPages = Math.ceil(articleColumns.length / columnsPerPage);
  
  const visibleColumns = articleColumns.slice(
    currentPage * columnsPerPage,
    (currentPage + 1) * columnsPerPage
  );

  // Handle wheel scroll navigation
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Prevent multiple rapid scrolls
      if (isWheeling.current) return;
      
      e.preventDefault();
      
      isWheeling.current = true;
      
      // Determine scroll direction
      if (e.deltaY > 0) {
        // Scrolling down - go to next page
        setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
      } else if (e.deltaY < 0) {
        // Scrolling up - go to previous page
        setCurrentPage((prev) => Math.max(prev - 1, 0));
      }
      
      // Reset after a delay to prevent too rapid navigation
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
      
      wheelTimeoutRef.current = setTimeout(() => {
        isWheeling.current = false;
      }, 800);
    };
    
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
    };
  }, [totalPages]);

  const handleSelectArticle = (article: typeof searchSuggestions[0]) => {
    // Calculate which page the article is on
    const pageIndex = Math.floor(article.columnIndex / columnsPerPage);
    
    // Close suggestions immediately
    setSearchQuery("");
    setShowSuggestions(false);
    
    // Pause the animation on the target column FIRST
    setPausedColumns(new Set([article.columnId]));
    
    // Navigate to the page if different
    if (pageIndex !== currentPage) {
      setCurrentPage(pageIndex);
    }
    
    // Wait for navigation, pause, and DOM update
    setTimeout(() => {
      const articleElement = document.querySelector(`[data-article-id="${article.uniqueId}"]`) as HTMLElement;
      if (articleElement) {
        // Find the ScrollArea viewport (radix-ui creates a viewport div)
        const scrollViewport = articleElement.closest('[data-radix-scroll-area-viewport]') as HTMLElement;
        
        if (scrollViewport) {
          // Get the article's position relative to the viewport
          const viewportRect = scrollViewport.getBoundingClientRect();
          const articleRect = articleElement.getBoundingClientRect();
          const currentScrollTop = scrollViewport.scrollTop;
          
          // Calculate target scroll position (scroll to the top of the article)
          const targetScroll = currentScrollTop + (articleRect.top - viewportRect.top) - 20; // 20px padding from top
          
          // Scroll to the article
          scrollViewport.scrollTo({ 
            top: Math.max(0, targetScroll), 
            behavior: 'smooth' 
          });
          
          // Highlight the article
          setHighlightedArticle(article.uniqueId);
          
          // Clear highlight and resume animation after 5 seconds
          setTimeout(() => {
            setHighlightedArticle(null);
            setPausedColumns(new Set());
          }, 5000);
        }
      }
    }, pageIndex !== currentPage ? 600 : 300);
  };

  return (
    <div className="h-screen bg-background overflow-hidden flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-8 py-4 flex items-center justify-between">
        <h1 className="font-headline font-bold text-2xl">THE DAILY CHRONICLE</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
          <Input 
            placeholder="Search articles..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchSuggestions.length > 0) {
                handleSelectArticle(searchSuggestions[0]);
              }
            }}
            onBlur={() => {
              // Delay closing to allow clicking on suggestions
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            onFocus={() => {
              if (searchQuery.trim()) {
                setShowSuggestions(true);
              }
            }}
          />
          {showSuggestions && searchQuery.trim() !== '' && (
            <Card className="absolute top-full mt-2 w-80 right-0 z-50 p-0 shadow-lg">
              <Command>
                <CommandList>
                  <CommandGroup heading="Suggestions">
                    {searchSuggestions.length > 0 ? (
                      searchSuggestions.map((article) => (
                        <CommandItem
                          key={article.uniqueId}
                          onSelect={() => handleSelectArticle(article)}
                          className="cursor-pointer"
                        >
                          <div className="flex flex-col gap-1">
                            <div className="font-semibold text-sm">{article.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {article.category} • {article.author}
                            </div>
                          </div>
                        </CommandItem>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                        No matches found
                      </div>
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </Card>
          )}
        </div>
      </header>

      <div className="article-grid flex flex-col md:flex-row gap-0 flex-1 overflow-hidden">
        {/* Article Columns Section */}
        <div className="flex flex-col flex-1 border-r border-border">
          {/* Dot Navigation for Article Columns */}
          <div className="flex justify-center items-center gap-3 py-4 border-b border-border">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  currentPage === index 
                    ? 'bg-primary scale-125' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>

          {/* Article Columns */}
          <div className="flex flex-1 overflow-hidden">
            {visibleColumns.map((column) => (
              <ScrollArea key={column.id} className="article-container h-full border-r border-border flex-1">
                <div 
                  className={`p-8 ${!pausedColumns.has(column.id) ? `auto-scroll-${column.direction}` : ''}`}
                  style={pausedColumns.has(column.id) ? { animation: 'none' } : undefined}
                >
                  <div className="pb-8">
                    {/* Render articles */}
                    {column.articles.map((article, idx) => {
                      const articleId = `${column.id}-${idx}`;
                      const isHighlighted = highlightedArticle === articleId;
                      return (
                      <div key={articleId}>
                        <article 
                          data-article-id={articleId}
                          className={`mb-8 transition-all duration-500 ${isHighlighted ? 'ring-4 ring-primary ring-offset-4 rounded-lg p-4 bg-primary/5' : ''}`}
                          style={{ minHeight: article.minHeight }}
                          onMouseEnter={(e) => {
                            // Only scroll on hover if not currently highlighted from search
                            if (!isHighlighted) {
                              const articleElement = e.currentTarget;
                              const scrollContainer = articleElement.closest('.article-container');
                              if (scrollContainer) {
                                const containerRect = scrollContainer.getBoundingClientRect();
                                const articleRect = articleElement.getBoundingClientRect();
                                const scrollTop = scrollContainer.scrollTop;
                                const targetScroll = scrollTop + articleRect.top - containerRect.top;
                                scrollContainer.scrollTo({ top: targetScroll, behavior: 'smooth' });
                              }
                            }
                          }}
                        >
                          <Badge className={`mb-2 bg-${article.categoryColor} text-${article.categoryColor}-foreground font-body uppercase text-xs`}>
                            {article.category}
                          </Badge>
                          <h3 className={`font-headline font-bold leading-tight mb-3 ${
                            article.minHeight === '600px' ? 'text-3xl' : 
                            article.minHeight === '500px' ? 'text-2xl' : 
                            article.minHeight === '400px' ? 'text-2xl' :
                            article.minHeight === '300px' ? 'text-2xl' : 'text-xl'
                          }`}>
                            {article.title}
                          </h3>
                          <p className="text-sm font-body leading-relaxed text-muted-foreground mb-2">
                            By {article.author}
                          </p>
                          {expandedArticle === articleId ? (
                            <>
                              <div className="space-y-4">
                                {article.content.map((paragraph, pIdx) => (
                                  <p key={pIdx} className="text-sm font-body leading-relaxed">
                                    {paragraph}
                                  </p>
                                ))}
                              </div>
                              {'videoId' in article && article.videoId && (
                                <YouTubeEmbed videoId={article.videoId} />
                              )}
                              <button 
                                onClick={() => setExpandedArticle(null)}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-4 font-body"
                              >
                                Show less ↑
                              </button>
                            </>
                          ) : (
                            <>
                              <div className={`overflow-hidden ${
                                article.minHeight === '600px' ? 'max-h-80' : 
                                article.minHeight === '500px' ? 'max-h-64' : 
                                article.minHeight === '450px' ? 'max-h-56' :
                                article.minHeight === '350px' ? 'max-h-40' : 
                                article.minHeight === '300px' ? 'max-h-32' : 'max-h-48'
                              }`}>
                                {article.content.map((paragraph, pIdx) => (
                                  <p key={pIdx} className={`text-sm font-body leading-relaxed ${pIdx < article.content.length - 1 ? 'mb-4' : ''}`}>
                                    {paragraph}
                                  </p>
                                ))}
                              </div>
                              <button 
                                onClick={() => setExpandedArticle(articleId)}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-2 font-body"
                              >
                                Continue reading →
                              </button>
                            </>
                          )}
                        </article>
                        {idx < column.articles.length - 1 && <Separator className="my-6" />}
                      </div>
                    )}
                    )}
                    
                    {/* Duplicate content for seamless loop */}
                    {column.articles.map((article, idx) => {
                      const articleId = `${column.id}-${idx}`;
                      const isHighlighted = highlightedArticle === articleId;
                      return (
                      <div key={`${column.id}-dup-${idx}`}>
                        <article 
                          className={`mb-8 transition-all duration-500 ${isHighlighted ? 'ring-4 ring-primary ring-offset-4 rounded-lg p-4 bg-primary/5' : ''}`}
                          style={{ minHeight: article.minHeight }}
                          onMouseEnter={(e) => {
                            // Only scroll on hover if not currently highlighted from search
                            if (!isHighlighted) {
                              const articleElement = e.currentTarget;
                              const scrollContainer = articleElement.closest('.article-container');
                              if (scrollContainer) {
                                const containerRect = scrollContainer.getBoundingClientRect();
                                const articleRect = articleElement.getBoundingClientRect();
                                const scrollTop = scrollContainer.scrollTop;
                                const targetScroll = scrollTop + articleRect.top - containerRect.top;
                                scrollContainer.scrollTo({ top: targetScroll, behavior: 'smooth' });
                              }
                            }
                          }}
                        >
                          <Badge className={`mb-2 bg-${article.categoryColor} text-${article.categoryColor}-foreground font-body uppercase text-xs`}>
                            {article.category}
                          </Badge>
                          <h3 className={`font-headline font-bold leading-tight mb-3 ${
                            article.minHeight === '600px' ? 'text-3xl' : 
                            article.minHeight === '500px' ? 'text-2xl' : 
                            article.minHeight === '400px' ? 'text-2xl' :
                            article.minHeight === '300px' ? 'text-2xl' : 'text-xl'
                          }`}>
                            {article.title}
                          </h3>
                          <p className="text-sm font-body leading-relaxed text-muted-foreground mb-2">
                            By {article.author}
                          </p>
                          <div className={`overflow-hidden ${
                            article.minHeight === '600px' ? 'max-h-80' : 
                            article.minHeight === '500px' ? 'max-h-64' : 
                            article.minHeight === '450px' ? 'max-h-56' :
                            article.minHeight === '350px' ? 'max-h-40' : 
                            article.minHeight === '300px' ? 'max-h-32' : 'max-h-48'
                          }`}>
                            {article.content.map((paragraph, pIdx) => (
                              <p key={pIdx} className={`text-sm font-body leading-relaxed ${pIdx < article.content.length - 1 ? 'mb-4' : ''}`}>
                                {paragraph}
                              </p>
                            ))}
                          </div>
                          <button 
                            onClick={() => setExpandedArticle(`${column.id}-${idx}`)}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-2 font-body"
                          >
                            Continue reading →
                          </button>
                        </article>
                        {idx < column.articles.length - 1 && <Separator className="my-6" />}
                      </div>
                    )}
                    )}
                  </div>
                </div>
              </ScrollArea>
            ))}
          </div>
        </div>

        {/* Trending Sidebar - Fixed Section */}
        <div className="h-full w-80 border-l border-border p-8 flex flex-col gap-6">
          {/* Fixed Trending Section - Takes half height */}
          <Card className="bg-muted border-2 border-border flex flex-col" style={{ height: '50vh' }}>
            <h4 className="font-headline font-bold text-xl mb-4 border-b-2 border-foreground pb-2 px-4 pt-4">
              TRENDING NOW
            </h4>
            {/* Scrollable content inside with auto-scroll */}
            <ScrollArea className="flex-1">
              <div className="px-4 pb-4 auto-scroll-down">
                <ul className="space-y-3">
                  {[
                    "Market Analysis: What Investors Need to Know",
                    "Education Reform: New Proposals Emerge",
                    "Sports: Championship Finals Preview",
                    "Arts & Culture: Museum Exhibition Opens",
                    "Science: Breakthrough in Medical Research",
                    "Housing Market Shows Unexpected Growth",
                    "International Trade Agreements Updated",
                    "Technology: AI Advances Transform Industries",
                    "Climate Action: New Policies Announced",
                    "Healthcare: Breakthrough Treatment Approved"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="font-headline font-bold text-lg mr-3 text-primary">{index + 1}.</span>
                      <span className="text-sm font-body leading-tight">{item}</span>
                    </li>
                  ))}
                </ul>
                {/* Duplicate for seamless loop */}
                <ul className="space-y-3 mt-6">
                  {[
                    "Market Analysis: What Investors Need to Know",
                    "Education Reform: New Proposals Emerge",
                    "Sports: Championship Finals Preview",
                    "Arts & Culture: Museum Exhibition Opens",
                    "Science: Breakthrough in Medical Research",
                    "Housing Market Shows Unexpected Growth",
                    "International Trade Agreements Updated",
                    "Technology: AI Advances Transform Industries",
                    "Climate Action: New Policies Announced",
                    "Healthcare: Breakthrough Treatment Approved"
                  ].map((item, index) => (
                    <li key={`dup-${index}`} className="flex items-start">
                      <span className="font-headline font-bold text-lg mr-3 text-primary">{index + 1}.</span>
                      <span className="text-sm font-body leading-tight">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollArea>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default Index;
