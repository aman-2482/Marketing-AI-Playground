import json

ACTIVITIES = [
    {
        "name": "Social Media Post Generator",
        "slug": "social-media-generator",
        "description": "Create engaging social media posts for different platforms. Practice crafting platform-specific content, hashtags, and calls-to-action.",
        "category": "Content Creation",
        "icon": "share-2",
        "order": 1,
        "instructions": """## What You'll Practice
- Writing effective prompts for social media content
- Tailoring tone and format for different platforms (LinkedIn, Instagram, Twitter/X, Facebook)
- Using AI to generate hashtags and calls-to-action

## How to Use
1. Fill in your product/service details below
2. Choose your target platform and tone
3. Click Generate and review the output
4. Try modifying your prompt to see how the output changes

## Try These Variations
- Change the tone from professional to casual and compare
- Ask for the same content adapted to different platforms
- Request multiple variations and pick the best one""",
        "tips": """- Be specific about your target audience (e.g., "B2B SaaS founders" not just "business people")
- Mention the platform explicitly in your prompt
- Specify the desired length (e.g., "under 280 characters for Twitter")
- Include brand voice guidelines (e.g., "witty but professional")
- Ask for emoji suggestions separately if needed""",
        "system_prompt": "You are an expert social media marketing strategist. You create engaging, platform-optimized social media posts that drive engagement. Always include relevant hashtags and a clear call-to-action. Format your output clearly with the post content, hashtags, and any notes separated.",
        "example_inputs": json.dumps({
            "product": "An AI-powered project management tool for remote teams",
            "platform": "LinkedIn",
            "tone": "Professional but approachable",
            "audience": "Tech startup founders and remote team leads"
        }),
        "input_fields": json.dumps([
            {"name": "product", "label": "Product/Service", "type": "text", "placeholder": "Describe your product or service..."},
            {"name": "platform", "label": "Platform", "type": "select", "options": ["LinkedIn", "Instagram", "Twitter/X", "Facebook", "TikTok"]},
            {"name": "tone", "label": "Tone", "type": "select", "options": ["Professional", "Casual & Friendly", "Witty & Humorous", "Inspirational", "Urgent & Persuasive"]},
            {"name": "audience", "label": "Target Audience", "type": "text", "placeholder": "Who is this for?"},
            {"name": "goal", "label": "Goal", "type": "select", "options": ["Brand Awareness", "Drive Traffic", "Generate Leads", "Engagement", "Product Launch"]}
        ]),
    },
    {
        "name": "Email Campaign Builder",
        "slug": "email-campaign-builder",
        "description": "Generate complete marketing email campaigns with subject lines, body copy, and CTAs. Learn how prompt details affect email effectiveness.",
        "category": "Content Creation",
        "icon": "mail",
        "order": 2,
        "instructions": """## What You'll Practice
- Crafting prompts for email marketing content
- Generating compelling subject lines
- Creating personalized email body copy
- Writing effective calls-to-action

## How to Use
1. Define your email campaign parameters below
2. Click Generate to create your email
3. Pay attention to how the AI structures the email
4. Iterate on your prompt to improve the output

## Try These Variations
- Generate 3 different subject lines and evaluate which is best
- Change the email type (welcome, promotional, re-engagement) and compare
- Try different CTAs and see how they change the email tone""",
        "tips": """- Specify the email type (welcome, newsletter, promotional, re-engagement, abandoned cart)
- Include the sender's brand personality
- Mention if it should be short (mobile-friendly) or detailed
- Ask for A/B test variations of subject lines
- Specify any compliance needs (CAN-SPAM, unsubscribe link mention)""",
        "system_prompt": "You are an expert email marketing copywriter. Create compelling marketing emails that drive opens and clicks. Always include: a subject line (and 2 alternatives), preview text, email body with clear structure, and a strong CTA. Format output with clear sections.",
        "example_inputs": json.dumps({
            "product": "Online cooking class subscription",
            "email_type": "Welcome Email",
            "audience": "Home cooks who just signed up",
            "goal": "Onboard and encourage first class booking"
        }),
        "input_fields": json.dumps([
            {"name": "product", "label": "Product/Service", "type": "text", "placeholder": "What are you promoting?"},
            {"name": "email_type", "label": "Email Type", "type": "select", "options": ["Welcome Email", "Promotional", "Newsletter", "Re-engagement", "Abandoned Cart", "Product Launch", "Event Invitation"]},
            {"name": "audience", "label": "Target Audience", "type": "text", "placeholder": "Who receives this email?"},
            {"name": "goal", "label": "Campaign Goal", "type": "text", "placeholder": "What action should readers take?"},
            {"name": "tone", "label": "Brand Tone", "type": "select", "options": ["Professional", "Friendly & Warm", "Urgent", "Luxurious", "Playful"]}
        ]),
    },
    {
        "name": "Ad Copy Workshop",
        "slug": "ad-copy-workshop",
        "description": "Create high-converting ad copy for Google Ads, Facebook/Meta Ads, and display advertising. Practice writing within character limits.",
        "category": "Advertising",
        "icon": "megaphone",
        "order": 4,
        "instructions": """## What You'll Practice
- Writing concise, high-impact ad copy
- Working within platform character limits
- Creating compelling headlines and descriptions
- A/B testing different value propositions

## How to Use
1. Enter your product details and target platform
2. Generate ad copy variations
3. Compare different approaches (benefit-led, problem-led, social proof)
4. Refine your prompt to improve relevance

## Try These Variations
- Generate ads for the same product on different platforms
- Try benefit-focused vs. problem-focused ad angles
- Ask for variations targeting different customer pain points""",
        "tips": """- Google Ads headlines: max 30 chars, descriptions: max 90 chars
- Include specific numbers or statistics when possible
- Mention the unique selling proposition clearly
- Ask for multiple headline variations
- Test emotional vs. rational appeals""",
        "system_prompt": "You are a performance marketing expert specializing in paid advertising copy. Create compelling ad copy optimized for the specified platform. Follow platform-specific character limits strictly. Always provide multiple variations (at least 3 headlines, 2 descriptions). Include the ad format structure clearly.",
        "example_inputs": json.dumps({
            "product": "Premium noise-canceling headphones",
            "platform": "Google Search Ads",
            "usp": "40-hour battery life, industry-leading noise cancellation",
            "audience": "Remote workers and frequent travelers"
        }),
        "input_fields": json.dumps([
            {"name": "product", "label": "Product/Service", "type": "text", "placeholder": "What are you advertising?"},
            {"name": "platform", "label": "Ad Platform", "type": "select", "options": ["Google Search Ads", "Facebook/Meta Ads", "Instagram Ads", "LinkedIn Ads", "Display Ads"]},
            {"name": "usp", "label": "Unique Selling Proposition", "type": "text", "placeholder": "What makes your offer special?"},
            {"name": "audience", "label": "Target Audience", "type": "text", "placeholder": "Who are you targeting?"},
            {"name": "goal", "label": "Campaign Objective", "type": "select", "options": ["Conversions", "Traffic", "Brand Awareness", "App Installs", "Lead Generation"]}
        ]),
    },
    {
        "name": "Brand Voice Lab",
        "slug": "brand-voice-lab",
        "description": "Define and test brand voice guidelines with AI. Learn how system prompts and style instructions shape AI output to match your brand.",
        "category": "Branding",
        "icon": "palette",
        "order": 5,
        "instructions": """## What You'll Practice
- Defining brand voice attributes for AI
- Using system prompts to control tone and style
- Testing consistency across different content types
- Understanding how AI interprets brand guidelines

## How to Use
1. Describe your brand's personality and values
2. Define voice attributes (e.g., witty, authoritative, warm)
3. Generate sample content and evaluate brand alignment
4. Refine your brand voice definition until output matches

## Try These Variations
- Define a luxury brand vs. a playful startup and compare outputs
- Generate the same message in 3 different brand voices
- Test if the AI maintains voice consistency across email, social, and web copy""",
        "tips": """- Use adjective pairs: "professional BUT approachable" helps AI understand nuance
- Provide examples of words/phrases TO USE and TO AVOID
- Include your brand's values and mission for context
- Test with different content types to check consistency
- Think of brand voice as a person: how would they talk at a dinner party?""",
        "system_prompt": "You are a brand strategist and copywriter. Help users define, test, and refine their brand voice. When given brand attributes, create sample content that perfectly embodies that voice. Provide analysis of how the voice comes through in the writing.",
        "example_inputs": json.dumps({
            "brand_name": "FreshBrew Coffee Co.",
            "personality": "Warm, adventurous, slightly nerdy about coffee",
            "values": "Sustainability, community, quality craftsmanship",
            "avoid": "Corporate jargon, aggressive sales language",
            "content_type": "Instagram caption about a new single-origin blend"
        }),
        "input_fields": json.dumps([
            {"name": "brand_name", "label": "Brand Name", "type": "text", "placeholder": "Your brand name"},
            {"name": "personality", "label": "Brand Personality", "type": "textarea", "placeholder": "Describe your brand as if it were a person..."},
            {"name": "values", "label": "Core Values", "type": "text", "placeholder": "What does your brand stand for?"},
            {"name": "avoid", "label": "Words/Tone to Avoid", "type": "text", "placeholder": "What should the brand NEVER sound like?"},
            {"name": "content_type", "label": "Content to Generate", "type": "select", "options": ["Social Media Post", "Website Headline", "Email Newsletter", "Product Description", "Customer Support Reply", "All of the Above"]}
        ]),
    },
    {
        "name": "Content Repurposer",
        "slug": "content-repurposer",
        "description": "Transform one piece of content into multiple formats for different channels. Practice the key marketing skill of content repurposing with AI.",
        "category": "Content Strategy",
        "icon": "repeat",
        "order": 6,
        "instructions": """## What You'll Practice
- Repurposing content across multiple channels
- Adapting tone, length, and format for different platforms
- Maintaining key messages while changing format
- Maximizing content ROI

## How to Use
1. Paste or describe your original content (blog post, article, video script)
2. Select the target formats you want
3. Generate repurposed versions
4. Compare how the core message adapts to each format

## Try These Variations
- Take a long blog post and turn it into a Twitter thread
- Convert a webinar summary into an email sequence
- Transform case study data into social proof snippets""",
        "tips": """- Paste the actual content rather than describing it for better results
- Specify what the KEY message or takeaway should be
- Mention platform-specific constraints (e.g., Instagram caption limit)
- Ask the AI to maintain specific data points or quotes
- Request a content calendar showing when to post each piece""",
        "system_prompt": "You are a content strategist specializing in content repurposing and multi-channel distribution. The user will specify which formats they want. You MUST generate content ONLY for the formats explicitly listed under 'Target Formats'. Do NOT generate content for any other format that is not listed — even if it seems related. Clearly label each repurposed piece with the format name as a heading. Adapt tone, length, and style to each platform's best practices while preserving the core message and any key data points.",
        "example_inputs": json.dumps({
            "original_content": "Our new study found that 73% of remote workers feel more productive when using AI-powered tools. The survey of 5,000 professionals across 12 industries revealed that the biggest productivity gains came from automated scheduling (89% improvement), email drafting (76% improvement), and data analysis (71% improvement).",
            "target_formats": "LinkedIn Post, Email Newsletter Snippet"
        }),
        "input_fields": json.dumps([
            {"name": "original_content", "label": "Original Content", "type": "textarea", "placeholder": "Paste your original content here (blog post, article, press release, etc.)..."},
            {"name": "target_formats", "label": "Target Formats", "type": "multiselect", "options": ["LinkedIn Post", "Twitter/X Thread", "Instagram Caption", "Email Newsletter Snippet", "Blog Summary", "Press Release", "Video Script Outline", "Infographic Copy", "Podcast Talking Points"]}
        ]),
    },
    {
        "name": "Customer Persona Generator",
        "slug": "customer-persona-generator",
        "description": "Build detailed customer personas from product and market data. Practice using AI to deepen audience understanding for targeted marketing.",
        "category": "Strategy",
        "icon": "users",
        "order": 7,
        "instructions": """## What You'll Practice
- Using AI to build detailed buyer personas
- Translating product features into customer needs
- Identifying audience pain points and motivations
- Creating actionable persona documents

## How to Use
1. Describe your product/service and market
2. Provide any known audience data
3. Generate a detailed persona
4. Iterate to create multiple personas for different segments

## Try These Variations
- Create personas for primary, secondary, and negative audiences
- Generate a persona for each stage of the buying journey
- Compare B2B vs. B2C personas for the same product""",
        "tips": """- Include demographic data you already know about your audience
- Mention competitors your audience might be using
- Ask for the persona's "day in the life" for richer context
- Request specific pain points and how your product addresses them
- Include budget/buying authority details for B2B personas""",
        "system_prompt": "You are a market research expert specializing in buyer persona development. Create detailed, actionable customer personas based on the provided product/market information. Include: demographics, psychographics, pain points, goals, preferred channels, buying behavior, objections, and messaging recommendations. Make personas feel like real people, not stereotypes.",
        "example_inputs": json.dumps({
            "product": "SaaS project management tool for creative agencies",
            "market": "Small to mid-size design and advertising agencies (10-50 employees)",
            "known_data": "Most customers found us through Google search or peer referrals. Average deal size $500/month."
        }),
        "input_fields": json.dumps([
            {"name": "product", "label": "Product/Service", "type": "text", "placeholder": "What do you sell?"},
            {"name": "market", "label": "Market/Industry", "type": "text", "placeholder": "What market are you in?"},
            {"name": "known_data", "label": "Known Audience Data", "type": "textarea", "placeholder": "Share any data you have about your current customers..."},
            {"name": "persona_type", "label": "Persona Type", "type": "select", "options": ["Primary Buyer", "Secondary Buyer", "Decision Maker (B2B)", "End User", "Negative Persona (Who NOT to target)"]}
        ]),
    },
    {
        "name": "SEO, AEO & GEO Content Optimizer",
        "slug": "seo-content-optimizer",
        "description": "Optimize content for traditional search engines (SEO), answer engines like featured snippets and voice search (AEO), and generative AI systems like ChatGPT and Gemini (GEO). Future-proof your content for how people actually search today.",
        "category": "SEO",
        "icon": "search",
        "order": 8,
        "instructions": """## What You'll Practice
- **SEO** – keyword integration, meta titles/descriptions, heading hierarchy, on-page structure
- **AEO (Answer Engine Optimization)** – featured snippets, voice search answers, concise Q&A formatting
- **GEO (Generative Engine Optimization)** – making content citable by ChatGPT, Gemini, Perplexity, and Claude

## How to Use
1. Paste your existing content or a topic/draft you want to optimize
2. Enter your primary keyword, secondary keywords, and target audience
3. Select the content type and search intent
4. Click Generate — you'll receive a 5-part optimized output
5. Review each section and iterate with follow-up prompts

## Output You'll Receive
1. **Optimized Article** – SEO-enhanced with improved headings, keyword integration, and readability
2. **Featured Snippet Answer** – A 40–60 word direct answer formatted for Position 0
3. **AI-Friendly Summary** – 3–4 lines ideal for AI citation (GEO)
4. **FAQ Section** – 3 questions with concise answers for AEO
5. **GEO Optimization Notes** – Tips for appearing in AI-generated answers

## Try These Variations
- Optimize the same content for informational vs. commercial intent
- Test different primary keywords to see how structure changes
- Ask the AI to prioritize AEO over SEO for voice-search-heavy topics""",
        "tips": """- **For SEO**: Provide 1 primary keyword and 3–5 secondary keywords; include search intent
- **For AEO**: Think about what question your content answers — include it explicitly
- **For GEO**: Use factual, authoritative language; cite statistics or data if available
- Specify your target audience precisely (e.g., "B2B SaaS marketers" not just "marketers")
- Ask for the list of changes alongside optimized content to learn what matters
- Remember: write for humans first — search engines and AI follow well-written content""",
        "system_prompt": """You are an experienced digital marketing strategist specializing in SEO, AEO (Answer Engine Optimization), and GEO (Generative Engine Optimization).

Task:
Optimize the following content so it performs well in:
1. Traditional search engines (Google SEO)
2. Answer engines (featured snippets, voice search, AI answers)
3. Generative AI systems (ChatGPT, Gemini, Perplexity, Claude)

SEO Requirements:
- Naturally integrate the primary keyword in the title, first 100 words, at least 2 subheadings, and throughout the body
- Write a compelling meta title (under 60 characters) and meta description (under 160 characters)
- Improve heading hierarchy (H1, H2, H3) for clarity and keyword coverage
- Ensure readability: short paragraphs, active voice, clear structure

AEO Requirements:
- Craft a concise featured snippet answer (40–60 words) that directly answers the main query
- Structure at least one section as a definition, list, or step-by-step format — the formats Google pulls for snippets
- Add an FAQ section with 3 common questions and clear, direct answers
- Optimize for conversational queries (voice search phrasing)

GEO Requirements:
- Write an AI-friendly summary (3–4 lines) that is factual, authoritative, and self-contained — suitable for citation by AI systems
- Use specific facts, data points, or clear claims that AI systems can reference
- Avoid vague language; be direct and citable
- Structure content with named concepts and clear entities (people, brands, tools, locations)

Output Format — provide all five sections:

## 1. Optimized Article
[Full optimized content with improved headings, keywords, and structure]

## 2. Featured Snippet Answer
[40–60 word direct answer to the primary query, ready for Position 0]

## 3. AI-Friendly Summary (GEO)
[3–4 authoritative sentences suitable for AI citation]

## 4. FAQ Section (AEO)
**Q1:** [Question]
**A:** [Concise answer]

**Q2:** [Question]
**A:** [Concise answer]

**Q3:** [Question]
**A:** [Concise answer]

## 5. GEO Optimization Notes
[3–5 specific tips for how this content can better appear in AI-generated answers]

After all sections, include a brief "Changes Made" summary explaining the key SEO, AEO, and GEO improvements applied.""",
        "example_inputs": json.dumps({
            "content": "Our coffee shop has great coffee. We serve many types of drinks. Come visit us at our downtown location. We also have pastries and a cozy atmosphere.",
            "primary_keyword": "specialty coffee shop downtown",
            "secondary_keywords": "artisan coffee, fresh pastries, local cafe, best espresso",
            "target_audience": "Coffee enthusiasts and remote workers aged 25–40 looking for a quality workspace cafe",
            "content_type": "Local Business Page",
            "intent": "Local/Commercial"
        }),
        "input_fields": json.dumps([
            {"name": "content", "label": "Content to Optimize", "type": "textarea", "placeholder": "Paste your existing content, article draft, or describe the topic you want to create content for..."},
            {"name": "primary_keyword", "label": "Primary Keyword", "type": "text", "placeholder": "e.g. best project management software for startups"},
            {"name": "secondary_keywords", "label": "Secondary Keywords", "type": "text", "placeholder": "3–5 related keywords, comma-separated"},
            {"name": "target_audience", "label": "Target Audience", "type": "text", "placeholder": "e.g. B2B SaaS founders looking to scale their team"},
            {"name": "content_type", "label": "Content Type", "type": "select", "options": ["Blog Article", "Landing Page", "Product Page", "Local Business Page", "How-To Guide", "Listicle", "FAQ Page"]},
            {"name": "intent", "label": "Search Intent", "type": "select", "options": ["Informational", "Commercial", "Transactional", "Navigational", "Local/Commercial"]}
        ]),
    },
    {
        "name": "Prompt A/B Tester",
        "slug": "prompt-ab-tester",
        "description": "The most educational tool: compare two prompts side-by-side to see how small changes dramatically affect AI output. Master prompt engineering through experimentation.",
        "category": "Prompt Engineering",
        "icon": "git-branch",
        "order": 9,
        "instructions": """## What You'll Practice
- Understanding how prompt wording affects AI output
- Learning what makes a good vs. bad prompt
- Experimenting with different prompt techniques
- Building intuition for prompt engineering

## How to Use
1. Write two versions of a prompt (Prompt A and Prompt B)
2. Click Compare to see both outputs side by side
3. Analyze the differences and understand WHY one is better
4. Iterate and refine your prompts

## Experiments to Try
1. **Specificity Test**: "Write a product description" vs "Write a 100-word product description for eco-conscious millennials highlighting sustainability features of a bamboo water bottle"
2. **Role Test**: "Write ad copy" vs "You are a senior copywriter at a top agency. Write ad copy..."
3. **Format Test**: "Create a social post" vs "Create a social post with: 1) Hook 2) Value 3) CTA 4) Hashtags"
4. **Tone Test**: Same prompt but change "professional" to "conversational"
5. **Chain of Thought**: "Give me a marketing strategy" vs "Think step by step: First analyze the market, then identify the target audience, then propose a marketing strategy" """,
        "tips": """- Change only ONE thing between Prompt A and B to isolate the effect
- Try adding "Think step by step" and see how output changes
- Experiment with giving AI a role/persona vs. no role
- Test the effect of including examples in your prompt
- Notice how adding constraints (word limit, format) improves output""",
        "system_prompt": "You are a helpful marketing assistant. Follow the user's instructions precisely and generate the requested marketing content.",
        "example_inputs": json.dumps({
            "prompt_a": "Write a product description for headphones.",
            "prompt_b": "You are a premium audio brand copywriter. Write a 150-word product description for wireless noise-canceling headphones targeting remote professionals. Highlight: comfort for all-day wear, 40-hour battery, and crystal-clear call quality. Use a confident but warm tone."
        }),
        "input_fields": json.dumps([
            {"name": "prompt_a", "label": "Prompt A", "type": "textarea", "placeholder": "Write your first prompt version..."},
            {"name": "prompt_b", "label": "Prompt B", "type": "textarea", "placeholder": "Write your second prompt version (change one thing)..."}
        ]),
    },
    {
        "name": "Competitive Intelligence Lab",
        "slug": "competitive-intelligence-lab",
        "description": "Analyze your competitors with AI to uncover weaknesses, market gaps, and differentiation opportunities. Build a sharper positioning and messaging strategy.",
        "category": "Strategy",
        "icon": "bar-chart-2",
        "order": 3,
        "instructions": """## What You'll Practice
- Structuring competitive analysis with AI
- Identifying competitor weaknesses and market gaps
- Crafting differentiation strategies based on research
- Developing sharper positioning and messaging

## How to Use
1. Describe your product clearly — what it does and who it's for
2. List 2–5 competitors (names are enough, or add context)
3. Click Generate to receive a structured competitive intelligence report
4. Use the output to refine your go-to-market positioning

## Output You'll Receive
1. **Competitor Strengths** — what they do well
2. **Competitor Weaknesses** — where they fall short
3. **Market Gaps** — unmet needs and whitespace opportunities
4. **Differentiation Strategy** — how your product can stand out
5. **Messaging Opportunity** — the narrative you should own

## Try These Variations
- Add customer pain points to get more targeted gap analysis
- Specify a target audience to sharpen the differentiation angle
- Compare your product's features directly against a single competitor""",
        "tips": """- The more specific your product description, the sharper the analysis
- Include pricing, positioning, or audience info about competitors if you have it
- Ask follow-up prompts like "Write a one-liner that positions us against [Competitor]"
- Use the messaging opportunity section as a starting point for your tagline or homepage headline
- Run the same analysis with different competitor sets to find your strongest angle""",
        "system_prompt": """You are a competitive intelligence analyst and brand strategist.

Analyze the provided product and competitors, then deliver a structured competitive intelligence report.

You MUST produce exactly these 5 sections and no others:

## 1. Competitor Strengths
For each competitor, list 2–3 specific strengths (brand, product, distribution, pricing, content, community, etc.).

## 2. Competitor Weaknesses
For each competitor, identify 2–3 genuine weaknesses or gaps (poor UX, missing features, narrow audience, high price, weak support, etc.).

## 3. Market Gaps
List 3–5 unmet needs or underserved segments that none of the listed competitors adequately address. Be specific — generic gaps are not useful.

## 4. Differentiation Strategy
Provide 3–4 concrete ways the described product can differentiate itself from the competition. Focus on sustainable, defensible advantages.

## 5. Messaging Opportunity
Write 2–3 specific messaging angles the product should own — the narrative, positioning statement, or emotional hook that competitors are NOT claiming. Include one example tagline or headline for each angle.

Be direct, specific, and actionable. Avoid vague strategy-speak.""",
        "example_inputs": json.dumps({
            "product": "GenAI Marketing Playground — a hands-on platform where marketers practice real AI marketing workflows through guided activities: ad copy, SEO/AEO/GEO, social media, brand voice, and prompt engineering. Targeted at digital marketers, growth marketers, and marketing students.",
            "competitors": "Jasper AI, Copy.ai, Writesonic",
            "target_audience": "Digital marketers and marketing students who want to learn AI tools through practice, not just theory"
        }),
        "input_fields": json.dumps([
            {"name": "product", "label": "Your Product", "type": "textarea", "placeholder": "Describe your product — what it does, who it's for, key features or differentiators..."},
            {"name": "competitors", "label": "Competitors", "type": "textarea", "placeholder": "List 2–5 competitors (e.g. Jasper, Copy.ai, Notion AI). Add context if you have it."},
            {"name": "target_audience", "label": "Target Audience", "type": "text", "placeholder": "e.g. B2B SaaS marketers at Series A startups"},
            {"name": "focus_area", "label": "Focus Area (optional)", "type": "select", "options": ["Overall positioning", "Product features", "Pricing strategy", "Content & SEO", "Community & brand", "Go-to-market"]}
        ]),
    },
]
