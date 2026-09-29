import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import IntakePage from './components/IntakePage';
import DashboardPage from './components/DashboardPage';
import StoryBank from './components/StoryBank';
import InterviewSession from './components/InterviewSession';
import FeedbackPage from './components/FeedbackPage';
import ProgressDashboard from './components/ProgressDashboard';
import PracticePlan from './components/PracticePlan';
import PlacementDashboard from './components/PlacementDashboard';
import PricingPage from './components/PricingPage';

import { ROLES, STRESS_MODES } from './data/mockData';
import { DB } from './data/db';

export default function App() {
  const [activePage, setActivePage] = useState('landing');

  // Load from DB permanently!
  const [userProfile, setUserProfile] = useState(() => DB.getProfile());
  const [resumeData, setResumeData] = useState(() => DB.getResume());
  const [storyBank, setStoryBank] = useState(() => DB.getStories());
  const [sessionHistory, setSessionHistory] = useState(() => DB.getHistory());

  // Selection states
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [stressMode, setStressMode] = useState(STRESS_MODES[1]);
  const [experience, setExperience] = useState(userProfile?.experience || 'Beginner');
  const [language, setLanguage] = useState(userProfile?.language || 'English');
  const [lastEvaluation, setLastEvaluation] = useState(null);

  // Sync state changes to DB permanently!
  const handleSaveProfile = (updatedProfile) => {
    setUserProfile(updatedProfile);
    DB.saveProfile(updatedProfile);
    setActivePage('dashboard');
  };

  const handleSaveResume = (updatedResume) => {
    setResumeData(updatedResume);
    DB.saveResume(updatedResume);
  };

  const handleFinishSession = (evalResultsList) => {
    if (evalResultsList && evalResultsList.length > 0) {
      const lastEval = evalResultsList[evalResultsList.length - 1];
      setLastEvaluation(lastEval);

      const newHistoryItem = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        role: selectedRole.title,
        mode: stressMode.title,
        score: lastEval.eval.overall_score_100 || 78,
        keyIssue: lastEval.eval.top_3_suggestions?.[0] || 'STAR Result Metric missing'
      };

      const updatedHistory = [...sessionHistory, newHistoryItem];
      setSessionHistory(updatedHistory);
      DB.saveHistory(updatedHistory);
    }
    setActivePage('feedback');
  };

  const handleAddStory = (newStory) => {
    const updatedStories = [...storyBank, newStory];
    setStoryBank(updatedStories);
    DB.saveStories(updatedStories);
  };

  const handleUpdateStory = (updatedStory) => {
    const updatedStories = storyBank.map(s => s.id === updatedStory.id ? updatedStory : s);
    setStoryBank(updatedStories);
    DB.saveStories(updatedStories);
  };

  const handleDeleteStory = (storyId) => {
    const updatedStories = storyBank.filter(s => s.id !== storyId);
    setStoryBank(updatedStories);
    DB.saveStories(updatedStories);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        userProfile={userProfile} 
      />

      <main style={{ flex: 1 }}>
        {activePage === 'landing' && (
          <LandingPage 
            onStartMock={() => setActivePage('dashboard')} 
            onExploreFeatures={() => setActivePage('intake')} 
          />
        )}

        {activePage === 'auth' && (
          <AuthPage 
            userProfile={userProfile} 
            onSaveProfile={handleSaveProfile} 
            onCancel={() => setActivePage('landing')} 
          />
        )}

        {activePage === 'intake' && (
          <IntakePage 
            resumeData={resumeData} 
            onSaveResume={handleSaveResume} 
            onProceedToInterview={() => setActivePage('dashboard')} 
          />
        )}

        {activePage === 'dashboard' && (
          <DashboardPage 
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
            stressMode={stressMode}
            setStressMode={setStressMode}
            experience={experience}
            setExperience={setExperience}
            language={language}
            setLanguage={setLanguage}
            lastSession={sessionHistory[sessionHistory.length - 1]}
            onLaunchInterview={() => setActivePage('session')}
            onGoToIntake={() => setActivePage('intake')}
          />
        )}

        {activePage === 'stories' && (
          <StoryBank 
            stories={storyBank}
            onAddStory={handleAddStory}
            onUpdateStory={handleUpdateStory}
            onDeleteStory={handleDeleteStory}
          />
        )}

        {activePage === 'session' && (
          <InterviewSession 
            role={selectedRole}
            stressMode={stressMode}
            language={language}
            resumeData={resumeData}
            storyBank={storyBank}
            onFinishSession={handleFinishSession}
            onCancelSession={() => setActivePage('dashboard')}
          />
        )}

        {activePage === 'feedback' && (
          <FeedbackPage 
            lastEvaluation={lastEvaluation}
            onRetryQuestion={() => setActivePage('session')}
            onAddToPracticePlan={() => setActivePage('plan')}
            onNextQuestion={() => setActivePage('session')}
            onFinishRound={() => setActivePage('progress')}
          />
        )}

        {activePage === 'progress' && (
          <ProgressDashboard 
            historyData={sessionHistory}
            onStartNewSession={() => setActivePage('dashboard')}
          />
        )}

        {activePage === 'plan' && (
          <PracticePlan 
            onStartDrill={() => setActivePage('session')}
          />
        )}

        {activePage === 'placement' && (
          <PlacementDashboard />
        )}

        {activePage === 'pricing' && (
          <PricingPage 
            onStartMock={() => setActivePage('dashboard')}
          />
        )}
      </main>
    </div>
  );
}
