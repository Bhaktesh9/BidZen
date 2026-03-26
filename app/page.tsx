'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-base relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-40 right-20 w-80 h-80 bg-gold/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(99,179,237,0.08)_0%,transparent_70%)]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section with Logo Left */}
        <section className="min-h-screen flex items-center justify-center px-4 py-10 sm:py-14">
          <div className="max-w-7xl w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left: Logo and Animation */}
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-[260px] sm:max-w-sm">
                  {/* Outer animated rings */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute w-52 h-52 sm:w-72 sm:h-72 border-2 border-primary/20 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
                    <div className="absolute w-60 h-60 sm:w-80 sm:h-80 border border-gold/10 rounded-full animate-spin" style={{ animationDuration: '30s', animationDirection: 'reverse' }} />
                  </div>

                  {/* Main Icon Container */}
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-gold/20 rounded-full blur-3xl" />
                    <Image
                      src="/icon.png"
                      alt="BidZen"
                      width={256}
                      height={256}
                      priority
                      className="relative h-40 w-40 sm:h-56 sm:w-56 lg:h-64 lg:w-64 rounded-3xl border border-subtle/50 bg-base/30 p-2 drop-shadow-2xl hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>

              {/* Right: Content */}
              <div className="space-y-5 sm:space-y-8 text-center lg:text-left">
                <div>
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-extrabold mb-3 sm:mb-4 leading-tight">
                    <span className="bg-gradient-to-r from-primary via-gold to-primary bg-clip-text text-transparent block">
                      BidZen
                    </span>
                    <span className="text-xl sm:text-2xl lg:text-3xl text-textSecondary font-light mt-1 sm:mt-2 block">
                      Live Auction Platform
                    </span>
                  </h1>
                  <div className="h-1 w-24 sm:w-32 bg-gradient-to-r from-primary to-gold rounded-full mt-3 sm:mt-4 mx-auto lg:mx-0" />
                </div>

                <p className="text-base sm:text-lg lg:text-xl text-textMuted leading-relaxed max-w-lg mx-auto lg:mx-0">
                  Experience the future of auctions. Real-time bidding, instant updates, and seamless control all in one powerful platform.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 sm:gap-6 py-5 sm:py-8 border-y border-subtle/30">
                  <div>
                    <div className="text-2xl sm:text-4xl font-display font-bold text-primary mb-1">100%</div>
                    <p className="text-xs text-textMuted uppercase tracking-wider">Real-Time</p>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-4xl font-display font-bold text-gold mb-1">Instant</div>
                    <p className="text-xs text-textMuted uppercase tracking-wider">Updates</p>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-4xl font-display font-bold text-primary mb-1">∞</div>
                    <p className="text-xs text-textMuted uppercase tracking-wider">Scalable</p>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
                  <Link
                    href="/login"
                    className="w-full sm:w-auto bg-gradient-to-r from-primary to-gold text-base font-display font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105 text-center"
                  >
                    Enter the Arena
                  </Link>
                  <Link
                    href="/login"
                    className="w-full sm:w-auto border-2 border-primary text-primary font-display font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-primary/5 transition-all duration-300 text-center"
                  >
                    Explore
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-14 sm:py-20 px-4 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold mb-3 sm:mb-4 text-textPrimary">
                Powered by Innovation
              </h2>
              <p className="text-base sm:text-lg text-textMuted max-w-2xl mx-auto">
                Everything you need for flawless auction management
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: '⚡', title: 'Real-Time', desc: 'Instant bid updates' },
                { icon: '🎯', title: 'Precision', desc: 'Exact control flow' },
                { icon: '🔒', title: 'Secure', desc: 'Enterprise security' },
                { icon: '📊', title: 'Analytics', desc: 'Live insights' }
              ].map((feature, i) => (
                <div 
                  key={i}
                  className="group p-4 sm:p-6 rounded-xl border border-subtle/30 bg-base/50 backdrop-blur-sm hover:border-primary/50 hover:bg-base/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
                >
                  <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                  <h3 className="font-semibold text-textPrimary mb-2">{feature.title}</h3>
                  <p className="text-sm text-textMuted">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="py-14 sm:py-20 px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="p-6 sm:p-12 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-gold/5 backdrop-blur-sm">
              <h2 className="text-2xl sm:text-4xl font-display font-bold text-textPrimary mb-3 sm:mb-4">
                Ready to Transform Your Auctions?
              </h2>
              <p className="text-base sm:text-lg text-textMuted mb-6 sm:mb-8 max-w-2xl mx-auto">
                Join thousands of auctioneers discovering the power of BidZen
              </p>
              <Link
                href="/login"
                className="inline-block w-full sm:w-auto bg-gradient-to-r from-primary to-gold text-base font-display font-bold px-8 sm:px-10 py-3 sm:py-4 rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
              >
                Get Started Now
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-subtle/20 relative">
          <div className="max-w-7xl mx-auto text-center text-sm text-textMuted">
            © 2026 BidZen. The Ultimate Real-Time Auction Platform.
          </div>
        </footer>
      </div>
    </div>
  );
}
