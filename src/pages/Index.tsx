import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import articlesData from "@/data/articles.json";

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

// Article column data from JSON - sort articles by date descending
const articleColumns = articlesData.columns.map(column => ({
  ...column,
  articles: [...column.articles].sort((a, b) => {
    const dateA = new Date(a.date || '2000-01-01').getTime();
    const dateB = new Date(b.date || '2000-01-01').getTime();
    return dateB - dateA; // descending order (newest first)
  })
}));

const Index = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedArticle, setHighlightedArticle] = useState<string | null>(null);
  const [pausedColumns, setPausedColumns] = useState<Set<number>>(new Set());
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [mediaArticle, setMediaArticle] = useState<any>(null);
  const [isMediaHovered, setIsMediaHovered] = useState(false);
  const [isTrendingHovered, setIsTrendingHovered] = useState(false);
  const columnsPerPage = 2;
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isWheeling = useRef(false);
  const dotNavRef = useRef<HTMLDivElement | null>(null);
  const isDotNavHovered = useRef(false);
  
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

  // Handle wheel scroll navigation - only when hovering dot navigation
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Only trigger if hovering over dot navigation
      if (!isDotNavHovered.current) return;
      
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
          <div 
            ref={dotNavRef}
            onMouseEnter={() => isDotNavHovered.current = true}
            onMouseLeave={() => isDotNavHovered.current = false}
            className="flex justify-center items-center gap-3 py-4 border-b border-border"
          >
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
                  {/* Category Header */}
                  <div className="mb-8 pb-4 border-b-2 border-border sticky top-0 bg-background z-10">
                    <h2 className="font-headline font-bold text-3xl uppercase tracking-wide">
                      {column.category}
                    </h2>
                  </div>
                  
                  <div className="pb-8">
                    {/* Render articles */}
                     {column.articles.map((article, idx) => {
                      const articleId = `${column.id}-${idx}`;
                      const isHighlighted = highlightedArticle === articleId;
                      const isExpanded = expandedArticle === articleId;
                      
                      return (
                      <div key={articleId}>
                        <article 
                          data-article-id={articleId}
                          className={`mb-8 transition-all duration-500 cursor-pointer ${isHighlighted ? 'ring-4 ring-primary ring-offset-4 rounded-lg p-4 bg-primary/5' : ''}`}
                          onClick={(e) => {
                            // If another article is expanded, close it and open this one
                            setPausedColumns(new Set([column.id]));
                            setExpandedArticle(articleId);
                            
                            // Set media if available
                            if ('videoId' in article && article.videoId) {
                              setMediaArticle(article);
                            } else {
                              setMediaArticle(null);
                            }
                            
                            // Scroll to show full article from top
                            const articleElement = e.currentTarget;
                            const scrollViewport = articleElement.closest('[data-radix-scroll-area-viewport]') as HTMLElement;
                            if (scrollViewport) {
                              const viewportRect = scrollViewport.getBoundingClientRect();
                              const articleRect = articleElement.getBoundingClientRect();
                              const currentScrollTop = scrollViewport.scrollTop;
                              const targetScroll = currentScrollTop + (articleRect.top - viewportRect.top) - 20;
                              scrollViewport.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
                            }
                          }}
                          onMouseEnter={(e) => {
                            if (isHighlighted) return;
                            
                            const articleElement = e.currentTarget;
                            const scrollContainer = articleElement.closest('.article-container');
                            if (scrollContainer) {
                              const containerRect = scrollContainer.getBoundingClientRect();
                              const articleRect = articleElement.getBoundingClientRect();
                              const scrollTop = scrollContainer.scrollTop;
                              const targetScroll = scrollTop + articleRect.top - containerRect.top;
                              scrollContainer.scrollTo({ top: targetScroll, behavior: 'smooth' });
                            }
                          }}
                        >
                          <h3 className={`font-headline font-bold leading-tight mb-3 text-2xl`}>
                            {article.title}
                          </h3>
                          <p className="text-sm font-body leading-relaxed text-muted-foreground mb-2">
                            By {article.author}
                          </p>
                          
                          {isExpanded ? (
                            <div className="space-y-4">
                              {article.content.map((paragraph: string, pIdx: number) => (
                                <p key={pIdx} className="text-sm font-body leading-relaxed">
                                  {paragraph}
                                </p>
                              ))}
                            </div>
                          ) : (
                            <>
                              <p className="text-sm font-body leading-relaxed">
                                {article.content[0].split(' ').slice(0, 17).join(' ')}...
                              </p>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  
                                  setPausedColumns(new Set([column.id]));
                                  setExpandedArticle(articleId);
                                  
                                  if ('videoId' in article && article.videoId) {
                                    setMediaArticle(article);
                                  } else {
                                    setMediaArticle(null);
                                  }
                                  
                                  const articleElement = e.currentTarget.closest('article');
                                  const scrollViewport = articleElement?.closest('[data-radix-scroll-area-viewport]') as HTMLElement;
                                  if (scrollViewport && articleElement) {
                                    const viewportRect = scrollViewport.getBoundingClientRect();
                                    const articleRect = articleElement.getBoundingClientRect();
                                    const currentScrollTop = scrollViewport.scrollTop;
                                    const targetScroll = currentScrollTop + (articleRect.top - viewportRect.top) - 20;
                                    scrollViewport.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
                                  }
                                }}
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
                      const isExpanded = expandedArticle === articleId;
                      
                      return (
                      <div key={`${column.id}-dup-${idx}`}>
                        <article 
                          className={`mb-8 transition-all duration-500 cursor-pointer ${isHighlighted ? 'ring-4 ring-primary ring-offset-4 rounded-lg p-4 bg-primary/5' : ''}`}
                          onClick={(e) => {
                            setPausedColumns(new Set([column.id]));
                            setExpandedArticle(articleId);
                            
                            if ('videoId' in article && article.videoId) {
                              setMediaArticle(article);
                            } else {
                              setMediaArticle(null);
                            }
                            
                            const articleElement = e.currentTarget;
                            const scrollViewport = articleElement.closest('[data-radix-scroll-area-viewport]') as HTMLElement;
                            if (scrollViewport) {
                              const viewportRect = scrollViewport.getBoundingClientRect();
                              const articleRect = articleElement.getBoundingClientRect();
                              const currentScrollTop = scrollViewport.scrollTop;
                              const targetScroll = currentScrollTop + (articleRect.top - viewportRect.top) - 20;
                              scrollViewport.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
                            }
                          }}
                          onMouseEnter={(e) => {
                            if (isHighlighted) return;
                            
                            const articleElement = e.currentTarget;
                            const scrollContainer = articleElement.closest('.article-container');
                            if (scrollContainer) {
                              const containerRect = scrollContainer.getBoundingClientRect();
                              const articleRect = articleElement.getBoundingClientRect();
                              const scrollTop = scrollContainer.scrollTop;
                              const targetScroll = scrollTop + articleRect.top - containerRect.top;
                              scrollContainer.scrollTo({ top: targetScroll, behavior: 'smooth' });
                            }
                          }}
                        >
                          <h3 className={`font-headline font-bold leading-tight mb-3 text-2xl`}>
                            {article.title}
                          </h3>
                          <p className="text-sm font-body leading-relaxed text-muted-foreground mb-2">
                            By {article.author}
                          </p>
                          
                          {isExpanded ? (
                            <div className="space-y-4">
                              {article.content.map((paragraph: string, pIdx: number) => (
                                <p key={pIdx} className="text-sm font-body leading-relaxed">
                                  {paragraph}
                                </p>
                              ))}
                            </div>
                          ) : (
                            <>
                              <p className="text-sm font-body leading-relaxed">
                                {article.content[0].split(' ').slice(0, 17).join(' ')}...
                              </p>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  
                                  setPausedColumns(new Set([column.id]));
                                  setExpandedArticle(articleId);
                                  
                                  if ('videoId' in article && article.videoId) {
                                    setMediaArticle(article);
                                  } else {
                                    setMediaArticle(null);
                                  }
                                  
                                  const articleElement = e.currentTarget.closest('article');
                                  const scrollViewport = articleElement?.closest('[data-radix-scroll-area-viewport]') as HTMLElement;
                                  if (scrollViewport && articleElement) {
                                    const viewportRect = scrollViewport.getBoundingClientRect();
                                    const articleRect = articleElement.getBoundingClientRect();
                                    const currentScrollTop = scrollViewport.scrollTop;
                                    const targetScroll = currentScrollTop + (articleRect.top - viewportRect.top) - 20;
                                    scrollViewport.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
                                  }
                                }}
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
                  </div>
                </div>
              </ScrollArea>
            ))}
          </div>
        </div>

        {/* Sidebar - Media and Trending */}
        <div className="h-full w-[45vw] border-l border-border p-4 flex flex-col gap-4 overflow-hidden">
          {/* Media Section */}
          <Card 
            className="bg-muted border-2 border-border flex flex-col overflow-hidden transition-all duration-500" 
            style={{ 
              height: mediaArticle 
                ? (isTrendingHovered && !isMediaHovered ? '15%' : '80%')
                : '20%'
            }}
            onMouseEnter={() => setIsMediaHovered(true)}
            onMouseLeave={() => setIsMediaHovered(false)}
          >
            <div className="flex items-center justify-between border-b-2 border-foreground pb-2 px-3 pt-3">
              <h4 className="font-headline font-bold text-xl">
                MEDIA
              </h4>
              {mediaArticle && (
                <button 
                  onClick={() => {
                    setMediaArticle(null);
                    setExpandedArticle(null);
                    setPausedColumns(new Set());
                  }}
                  className="text-2xl hover:text-primary transition-colors"
                >
                  ×
                </button>
              )}
            </div>
            {mediaArticle ? (
              <ScrollArea className="flex-1 px-3 pb-3 pt-3">
                {'videoId' in mediaArticle && mediaArticle.videoId && (
                  <YouTubeEmbed videoId={mediaArticle.videoId} />
                )}
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center flex-1 p-3">
                <p className="text-muted-foreground font-body text-center">
                  Click an article to display media here
                </p>
              </div>
            )}
          </Card>

          {/* Trending Section */}
          <Card 
            className="bg-muted border-2 border-border flex flex-col overflow-hidden transition-all duration-500" 
            style={{ 
              height: mediaArticle 
                ? (isTrendingHovered && !isMediaHovered ? '80%' : '15%')
                : '75%'
            }}
            onMouseEnter={() => setIsTrendingHovered(true)}
            onMouseLeave={() => setIsTrendingHovered(false)}
          >
            <h4 className="font-headline font-bold text-xl mb-4 border-b-2 border-foreground pb-2 px-3 pt-3">
              TRENDING NOW
            </h4>
            <div className="px-3 pb-3 overflow-auto">
              <ul className="space-y-3">
                {articlesData.trending.map((item, index) => (
                  <li 
                    key={index} 
                    className="flex items-start cursor-pointer hover:bg-background/50 p-2 rounded transition-colors"
                    onClick={() => {
                      // Find the article in the main columns
                      let foundArticle = null;
                      let foundColumnId = null;
                      let foundArticleIndex = null;
                      let foundColumnIndex = null;
                      
                      articleColumns.forEach((col, colIdx) => {
                        col.articles.forEach((art, artIdx) => {
                          if (art.title === item.title) {
                            foundArticle = art;
                            foundColumnId = col.id;
                            foundArticleIndex = artIdx;
                            foundColumnIndex = colIdx;
                          }
                        });
                      });
                      
                      if (foundArticle && foundColumnId !== null && foundArticleIndex !== null) {
                        const articleId = `${foundColumnId}-${foundArticleIndex}`;
                        
                        // Navigate to the page with the article
                        const pageIndex = Math.floor(foundColumnIndex / columnsPerPage);
                        if (pageIndex !== currentPage) {
                          setCurrentPage(pageIndex);
                        }
                        
                        // Set expanded and media, minimize trending and expand media
                        setPausedColumns(new Set([foundColumnId]));
                        setExpandedArticle(articleId);
                        setHighlightedArticle(articleId);
                        setIsMediaHovered(true);
                        setIsTrendingHovered(false);
                        
                        if ('videoId' in foundArticle && foundArticle.videoId) {
                          setMediaArticle(foundArticle);
                        } else {
                          setMediaArticle(null);
                        }
                        
                        // Scroll to article after navigation
                        setTimeout(() => {
                          const articleElement = document.querySelector(`[data-article-id="${articleId}"]`) as HTMLElement;
                          if (articleElement) {
                            const scrollViewport = articleElement.closest('[data-radix-scroll-area-viewport]') as HTMLElement;
                            if (scrollViewport) {
                              const viewportRect = scrollViewport.getBoundingClientRect();
                              const articleRect = articleElement.getBoundingClientRect();
                              const currentScrollTop = scrollViewport.scrollTop;
                              const targetScroll = currentScrollTop + (articleRect.top - viewportRect.top) - 20;
                              scrollViewport.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
                            }
                          }
                          
                          // Clear highlight after 3 seconds
                          setTimeout(() => {
                            setHighlightedArticle(null);
                          }, 3000);
                        }, pageIndex !== currentPage ? 600 : 100);
                      }
                    }}
                  >
                    <span className="font-headline font-bold text-lg mr-3 text-primary">{index + 1}.</span>
                    <span className="text-sm font-body leading-tight">{item.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
