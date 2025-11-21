import asyncHandler from "express-async-handler";
import axios from "axios";
import logger from "../utils/logger.js";

// Cache for news articles (refresh every 5 minutes)
let newsCache = {
  articles: [],
  lastFetch: null,
  cacheDuration: 5 * 60 * 1000, // 5 minutes
};

// Fetch tech news from NewsAPI (free tier)
const fetchTechNews = async () => {
  try {
    // Using NewsAPI - you can get a free API key from https://newsapi.org
    // For now, using a mock/fallback approach
    const apiKey = process.env.NEWS_API_KEY;
    
    if (apiKey) {
      const response = await axios.get(
        `https://newsapi.org/v2/top-headlines?category=technology&language=en&pageSize=10&apiKey=${apiKey}`,
        { timeout: 10000 }
      );
      
      if (response.data && response.data.articles) {
        return response.data.articles
          .filter(article => article.title && article.title !== "[Removed]")
          .map(article => ({
            title: article.title,
            description: article.description || article.content?.substring(0, 200) || "",
            url: article.url,
            imageUrl: article.urlToImage,
            source: article.source?.name || "Unknown",
            publishedAt: article.publishedAt,
            author: article.author,
          }));
      }
    }
    
    // Fallback: Return sample tech news if API key is not configured
    return getSampleTechNews();
  } catch (error) {
    logger.error(`Error fetching tech news: ${error.message}`);
    // Return sample news on error
    return getSampleTechNews();
  }
};

// Sample tech news for fallback/demo
const getSampleTechNews = () => {
  return [
    {
      title: "AI Breakthrough: New Language Model Surpasses Human Performance",
      description: "Researchers announce a new AI model that demonstrates superior understanding and reasoning capabilities across multiple domains.",
      url: "https://example.com/ai-breakthrough",
      imageUrl: null,
      source: "TechNews",
      publishedAt: new Date().toISOString(),
      author: "Tech Reporter",
    },
    {
      title: "Quantum Computing Milestone Achieved",
      description: "Scientists achieve stable quantum entanglement for extended periods, bringing practical quantum computing closer to reality.",
      url: "https://example.com/quantum-computing",
      imageUrl: null,
      source: "TechNews",
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      author: "Science Editor",
    },
    {
      title: "New Framework Simplifies Web Development",
      description: "Developers release an innovative framework that reduces development time by 40% while improving performance.",
      url: "https://example.com/web-framework",
      imageUrl: null,
      source: "TechNews",
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      author: "Dev News",
    },
    {
      title: "Cybersecurity: New Threat Detection System Launched",
      description: "Enterprise security solution uses machine learning to detect and prevent zero-day attacks in real-time.",
      url: "https://example.com/cybersecurity",
      imageUrl: null,
      source: "TechNews",
      publishedAt: new Date(Date.now() - 10800000).toISOString(),
      author: "Security Analyst",
    },
    {
      title: "Sustainable Tech: Green Data Centers Reduce Carbon Footprint",
      description: "Major tech companies invest in renewable energy solutions, reducing data center emissions by 60%.",
      url: "https://example.com/green-tech",
      imageUrl: null,
      source: "TechNews",
      publishedAt: new Date(Date.now() - 14400000).toISOString(),
      author: "Green Tech",
    },
  ];
};

export const getTechNews = asyncHandler(async (req, res) => {
  const now = Date.now();
  
  // Check if cache is valid
  if (
    newsCache.lastFetch &&
    now - newsCache.lastFetch < newsCache.cacheDuration &&
    newsCache.articles.length > 0
  ) {
    return res.json({
      success: true,
      data: newsCache.articles,
      cached: true,
      lastUpdated: new Date(newsCache.lastFetch).toISOString(),
    });
  }
  
  // Fetch fresh news
  try {
    const articles = await fetchTechNews();
    newsCache = {
      articles,
      lastFetch: now,
      cacheDuration: newsCache.cacheDuration,
    };
    
    res.json({
      success: true,
      data: articles,
      cached: false,
      lastUpdated: new Date(now).toISOString(),
    });
  } catch (error) {
    logger.error(`Error in getTechNews: ${error.message}`);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to fetch tech news",
        code: 500,
      },
    });
  }
});

// Force refresh news (admin only or for testing)
export const refreshTechNews = asyncHandler(async (req, res) => {
  try {
    const articles = await fetchTechNews();
    newsCache = {
      articles,
      lastFetch: Date.now(),
      cacheDuration: newsCache.cacheDuration,
    };
    
    res.json({
      success: true,
      message: "Tech news refreshed successfully",
      data: articles,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Error in refreshTechNews: ${error.message}`);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to refresh tech news",
        code: 500,
      },
    });
  }
});

