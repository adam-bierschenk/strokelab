# Performance Optimizations

## Summary of Changes

### 1. Next.js Configuration (next.config.mjs)

- **Image Optimization**: Configured AVIF and WebP formats for better compression
- **Remote Patterns**: Whitelisted GitHub and Google user images for OAuth  
- **Experimental Features**: optimizePackageImports for lucide-react, ppr for partial prerendering
- **Caching Strategy**: 24h cache for OG images, 1y for static assets
- **Bundle Analysis**: Integrated @next/bundle-analyzer

### 2. Loading Skeletons

Created skeleton components for dashboard, leaderboard, and round entry.

### 3. Error Boundary

Added error boundary for graceful error handling.

## Run Bundle Analysis
```bash
ANALYZE=true npm run build
```
