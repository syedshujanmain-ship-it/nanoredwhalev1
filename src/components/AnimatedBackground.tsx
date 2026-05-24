// AnimatedBackground - Ultimate animated backgrounds for Red Whale
import type { AnimatedTheme } from './ThemeSelector';

interface AnimatedBackgroundProps {
  theme: AnimatedTheme;
}

export function AnimatedBackground({ theme }: AnimatedBackgroundProps) {
  return (
    <div className="nano-cyclone-bg">
      {theme === 'cyclone' && (
        <>
          {/* Cyclone Theme - Red/Blue/White */}
          <div className="cyclone-element cyclone-red"></div>
          <div className="cyclone-element cyclone-blue"></div>
          <div className="cyclone-element cyclone-white"></div>
          <div className="wind-element wind-red"></div>
          <div className="wind-element wind-blue"></div>
          <div className="wind-element wind-white"></div>
          <div className="wind-element wind-red-2"></div>
          <div className="wind-element wind-blue-2"></div>
          <div className="particle particle-red"></div>
          <div className="particle particle-blue"></div>
          <div className="particle particle-white"></div>
          <div className="glow-orb glow-red"></div>
          <div className="glow-orb glow-blue"></div>
          <div className="glow-orb glow-white"></div>
        </>
      )}

      {theme === 'aurora' && (
        <>
          {/* Aurora Theme - Purple/Green/Cyan */}
          <div className="aurora-element aurora-purple"></div>
          <div className="aurora-element aurora-green"></div>
          <div className="aurora-element aurora-cyan"></div>
          <div className="aurora-wave aurora-wave-1"></div>
          <div className="aurora-wave aurora-wave-2"></div>
          <div className="aurora-wave aurora-wave-3"></div>
          <div className="particle particle-red" style={{ background: 'rgba(168, 85, 247, 0.8)' }}></div>
          <div className="particle particle-blue" style={{ background: 'rgba(34, 197, 94, 0.8)' }}></div>
          <div className="particle particle-white" style={{ background: 'rgba(6, 182, 212, 0.8)' }}></div>
          <div className="glow-orb glow-red" style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, rgba(168, 85, 247, 0) 70%)' }}></div>
          <div className="glow-orb glow-blue" style={{ background: 'radial-gradient(circle, rgba(34, 197, 94, 0.5) 0%, rgba(34, 197, 94, 0) 70%)' }}></div>
          <div className="glow-orb glow-white" style={{ background: 'radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, rgba(6, 182, 212, 0) 70%)' }}></div>
        </>
      )}

      {theme === 'fire' && (
        <>
          {/* Fire Storm Theme - Orange/Red/Yellow */}
          <div className="fire-element fire-orange"></div>
          <div className="fire-element fire-red"></div>
          <div className="fire-element fire-yellow"></div>
          <div className="fire-flame fire-flame-1"></div>
          <div className="fire-flame fire-flame-2"></div>
          <div className="fire-flame fire-flame-3"></div>
          <div className="particle particle-red" style={{ background: 'rgba(249, 115, 22, 0.9)' }}></div>
          <div className="particle particle-blue" style={{ background: 'rgba(239, 68, 68, 0.9)' }}></div>
          <div className="particle particle-white" style={{ background: 'rgba(234, 179, 8, 0.8)' }}></div>
          <div className="glow-orb glow-red" style={{ background: 'radial-gradient(circle, rgba(249, 115, 22, 0.6) 0%, rgba(249, 115, 22, 0) 70%)' }}></div>
          <div className="glow-orb glow-blue" style={{ background: 'radial-gradient(circle, rgba(239, 68, 68, 0.6) 0%, rgba(239, 68, 68, 0) 70%)' }}></div>
          <div className="glow-orb glow-white" style={{ background: 'radial-gradient(circle, rgba(234, 179, 8, 0.4) 0%, rgba(234, 179, 8, 0) 70%)' }}></div>
        </>
      )}

      {theme === 'ocean' && (
        <>
          {/* Ocean Wave Theme - Blue/Teal/White */}
          <div className="ocean-element ocean-blue"></div>
          <div className="ocean-element ocean-teal"></div>
          <div className="ocean-element ocean-white"></div>
          <div className="ocean-wave ocean-wave-1"></div>
          <div className="ocean-wave ocean-wave-2"></div>
          <div className="ocean-wave ocean-wave-3"></div>
          <div className="particle particle-red" style={{ background: 'rgba(59, 130, 246, 0.8)' }}></div>
          <div className="particle particle-blue" style={{ background: 'rgba(20, 184, 166, 0.8)' }}></div>
          <div className="particle particle-white" style={{ background: 'rgba(255, 255, 255, 0.8)' }}></div>
          <div className="glow-orb glow-red" style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, rgba(59, 130, 246, 0) 70%)' }}></div>
          <div className="glow-orb glow-blue" style={{ background: 'radial-gradient(circle, rgba(20, 184, 166, 0.5) 0%, rgba(20, 184, 166, 0) 70%)' }}></div>
          <div className="glow-orb glow-white" style={{ background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 70%)' }}></div>
        </>
      )}

      {theme === 'galaxy' && (
        <>
          {/* Galaxy Theme - Purple/Pink/Blue */}
          <div className="galaxy-element galaxy-purple"></div>
          <div className="galaxy-element galaxy-pink"></div>
          <div className="galaxy-element galaxy-blue"></div>
          <div className="galaxy-star galaxy-star-1"></div>
          <div className="galaxy-star galaxy-star-2"></div>
          <div className="galaxy-star galaxy-star-3"></div>
          <div className="galaxy-nebula galaxy-nebula-1"></div>
          <div className="galaxy-nebula galaxy-nebula-2"></div>
          <div className="particle particle-red" style={{ background: 'rgba(147, 51, 234, 0.9)' }}></div>
          <div className="particle particle-blue" style={{ background: 'rgba(236, 72, 153, 0.9)' }}></div>
          <div className="particle particle-white" style={{ background: 'rgba(99, 102, 241, 0.8)' }}></div>
          <div className="glow-orb glow-red" style={{ background: 'radial-gradient(circle, rgba(147, 51, 234, 0.5) 0%, rgba(147, 51, 234, 0) 70%)' }}></div>
          <div className="glow-orb glow-blue" style={{ background: 'radial-gradient(circle, rgba(236, 72, 153, 0.5) 0%, rgba(236, 72, 153, 0) 70%)' }}></div>
          <div className="glow-orb glow-white" style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, rgba(99, 102, 241, 0) 70%)' }}></div>
        </>
      )}
    </div>
  );
}
