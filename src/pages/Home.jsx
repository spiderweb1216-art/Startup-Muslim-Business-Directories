import React from 'react';
import Hero from '@/components/home/Hero';
import ExploreEcosystem from '@/components/home/ExploreEcosystem';
import EcosystemSnapshot from '@/components/home/EcosystemSnapshot';
import FeaturedList from '@/components/home/FeaturedList';
import PitchesBoard from '@/components/home/PitchesBoard';
import CategoryIndex from '@/components/home/CategoryIndex';
import FounderMagazine from '@/components/home/FounderMagazine';
import InvestorNetwork from '@/components/home/InvestorNetwork';
import OpportunitiesTimeline from '@/components/home/OpportunitiesTimeline';
import { PitchCTA, InvestorCTA, NewsletterCTA } from '@/components/home/CTASections';

export default function Home() {
  return (
    <div data-testid="home-page">
      <Hero />
      <ExploreEcosystem />
      <EcosystemSnapshot />
      <FeaturedList />
      <PitchesBoard />
      <CategoryIndex />
      <FounderMagazine />
      <InvestorNetwork />
      <OpportunitiesTimeline />
      <PitchCTA />
      <InvestorCTA />
      <NewsletterCTA />
    </div>
  );
}
