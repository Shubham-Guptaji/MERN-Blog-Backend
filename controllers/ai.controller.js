import axios from 'axios';
import Blog from '../models/blog.model.js';
import { ai } from '../app.js';
export const generateAISummary = async (req, res) => {
  try {
    const { postId } = req.params;
    // Fetch the blog post
    const blog = await Blog.findById(postId).populate('author', 'name');
    
    if (!blog) {
      console.log('Blog post not found');
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Create summary prompt
    const prompt = `Please provide a comprehensive summary of this blog post in 3-4 paragraphs. 
    Title: ${blog.title}
    Content: ${blog.content.substring(0, 3000)}...
    
    Please make the summary engaging and highlight the key points. Return response only in string format `;


    const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

    // Extract text from the response
    let summary = '';
    if (response && response.text) {
      summary = response.text;
    } else if (response && response.candidates && response.candidates[0]) {
      const candidate = response.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
        summary = candidate.content.parts[0].text || '';
      }
    } else if (response && response.data && response.data.text) {
      summary = response.data.text;
    } else {
      // Handle case where response is a string
      summary = typeof response === 'string' ? response : JSON.stringify(response);
    }

    // Clean up the summary to ensure it's a string
    if (typeof summary !== 'string') {
      summary = String(summary);
    }

    res.status(200).json({
      success: true,
      summary,
      title: blog.title
    }); 

  } catch (error) {
    console.error('AI Summary Error:', error);
    
    // Fallback to basic summary if OpenAI fails
    const blog = await Blog.findById(req.params.postId);
    if (blog) {
      const fallbackSummary = `
## Summary of "${blog.title}"

${blog.content.substring(0, 400)}...

*This is a basic summary. AI service is temporarily unavailable.*`;
      
      return res.status(200).json({
        success: true,
        summary: fallbackSummary,
        title: blog.title
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to generate summary'
    });
  }
};
