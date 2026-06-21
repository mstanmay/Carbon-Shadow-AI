import React from "react";
import { 
  PanelLeft, ChevronLeft, ChevronRight, Monitor, 
  RotateCw, Share, Plus, Copy, Grid, Compass, 
  Layers, ListTodo, Sparkles, Flame, CheckCircle, ArrowRight
} from "lucide-react";
import Logo from "./Logo";

export const DashboardMockup: React.FC = () => {
  return (
    <div className="w-[896px] rounded-t-2xl overflow-hidden bg-[#1a1a1c] shadow-[0_-20px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/10 text-left flex flex-col font-sans select-none">
      
      {/* Title Bar */}
      <div className="bg-[#242427] border-b border-white/5 px-4 py-2.5 flex items-center justify-between">
        {/* Left window controls & panels */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex gap-2 ml-4">
            <PanelLeft className="w-3.5 h-3.5 text-white/40 cursor-pointer hover:text-white/60" />
            <ChevronLeft className="w-3.5 h-3.5 text-white/40" />
            <ChevronRight className="w-3.5 h-3.5 text-white/25" />
          </div>
        </div>

        {/* Center URL */}
        <div className="bg-[#1a1a1c] rounded-md px-6 py-1 text-[10px] text-white/60 flex items-center gap-1.5 min-w-[280px] justify-center">
          <Monitor className="w-3.5 h-3.5 text-white/40" />
          <span>questly.ai</span>
        </div>

        {/* Right utility icons */}
        <div className="flex items-center gap-3 text-white/40">
          <RotateCw className="w-3.5 h-3.5 hover:text-white/60 cursor-pointer" />
          <Share className="w-3.5 h-3.5 hover:text-white/60 cursor-pointer" />
          <Plus className="w-3.5 h-3.5 hover:text-white/60 cursor-pointer" />
          <Copy className="w-3.5 h-3.5 hover:text-white/60 cursor-pointer" />
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div className="flex min-h-[500px]">
        
        {/* Sidebar */}
        <div className="w-[22%] border-r border-white/5 bg-[#1e1e21] px-3 py-3.5 flex flex-col justify-between">
          <div className="flex flex-col gap-5">
            {/* Logo / Org Section */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Logo className="w-4 h-4 text-white/70" />
                <span className="text-[10px] font-bold tracking-wider text-white/80">QUESTLY</span>
              </div>
              <Grid className="w-3.5 h-3.5 text-white/30" />
            </div>

            {/* Workspace Selection */}
            <div className="flex items-center gap-2 bg-white/[0.03] ring-1 ring-white/5 rounded-lg p-1.5">
              <div className="w-5 h-5 rounded bg-[#e8553f] flex items-center justify-center text-[9px] font-bold text-white">
                C
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-white/80">CareNest</span>
                <span className="text-[8px] text-white/40">Pro Workspace</span>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="flex flex-col gap-1">
              <div className="text-[8px] font-semibold text-white/30 px-1 py-1 uppercase tracking-wider">Discover</div>
              
              <div className="flex items-center gap-2 text-[10px] text-white/85 bg-white/[0.04] px-2 py-1.5 rounded-md cursor-pointer">
                <Compass className="w-3.5 h-3.5 text-white/70" />
                <span>Uncover Intent</span>
              </div>
              
              <div className="flex items-center gap-2 text-[10px] text-white/60 hover:text-white/85 px-2 py-1.5 rounded-md cursor-pointer transition-colors">
                <Layers className="w-3.5 h-3.5 text-white/45" />
                <span>Subject Groups</span>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-white/60 hover:text-white/85 px-2 py-1.5 rounded-md cursor-pointer transition-colors">
                <ListTodo className="w-3.5 h-3.5 text-white/45" />
                <span>Draft Inbox</span>
              </div>
            </div>

            {/* Recent Articles */}
            <div className="flex flex-col gap-1.5 mt-2">
              <div className="text-[8px] font-semibold text-white/30 px-1 uppercase tracking-wider">Ready to Release</div>
              
              <div className="flex items-center gap-1.5 px-1 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#28c840]/70 shrink-0" />
                <span className="text-[9px] text-white/65 truncate">Preventing falls at home...</span>
              </div>
              <div className="flex items-center gap-1.5 px-1 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#28c840]/70 shrink-0" />
                <span className="text-[9px] text-white/65 truncate">Best EV scooters for elderly...</span>
              </div>
              <div className="flex items-center gap-1.5 px-1 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#28c840]/70 shrink-0" />
                <span className="text-[9px] text-white/65 truncate">LEED housing metrics 2026...</span>
              </div>
            </div>
          </div>

          <div className="text-[8px] text-white/30 text-center px-1">
            System build v1.19.2
          </div>
        </div>

        {/* Workspace Content Area */}
        <div className="flex-1 bg-[#1a1a1c] p-5 flex flex-col gap-4">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#e8553f] flex items-center justify-center text-sm font-bold text-white">
                C
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold text-white">CareNest Dashboard</h3>
                  <span className="bg-[#28c840]/10 text-[#28c840] text-[8px] font-medium px-1.5 py-0.5 rounded-full">Active</span>
                </div>
                <span className="text-[9px] text-white/45">Review generated content and optimization drafts</span>
              </div>
            </div>

            <button className="flex items-center gap-1.5 bg-white text-gray-950 text-[10px] font-medium px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors shadow-sm">
              <Sparkles className="w-3 h-3 text-[#e8553f]" />
              <span>Generate Draft</span>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 divide-x divide-white/5 rounded-xl bg-white/[0.02] ring-1 ring-white/5 py-3.5">
            <div className="px-4 flex flex-col">
              <span className="text-[8px] tracking-wider text-white/35 font-medium uppercase">POSTS INDEXED</span>
              <span className="text-xl font-semibold text-white mt-1">62</span>
              <span className="text-[8px] text-[#28c840] mt-0.5">+4.2% vs last month</span>
            </div>
            
            <div className="px-4 flex flex-col">
              <span className="text-[8px] tracking-wider text-white/35 font-medium uppercase">SUBJECT GROUPS</span>
              <span className="text-xl font-semibold text-white mt-1">12</span>
              <span className="text-[8px] text-white/45 mt-0.5">Broad taxonomy coverage</span>
            </div>

            <div className="px-4 flex flex-col">
              <span className="text-[8px] tracking-wider text-white/35 font-medium uppercase">READY TO DRAFT</span>
              <span className="text-xl font-semibold text-white mt-1">412</span>
              <span className="text-[8px] text-[#febc2e]/85 mt-0.5">25 highly critical</span>
            </div>

            <div className="px-4 flex flex-col">
              <span className="text-[8px] tracking-wider text-white/35 font-medium uppercase">SEARCHES / MONTH</span>
              <span className="text-xl font-semibold text-white mt-1">3,156,200</span>
              <span className="text-[8px] text-white/45 mt-0.5">Potential organic reach</span>
            </div>
          </div>

          {/* Subject Cards */}
          <div>
            <div className="text-[9px] font-bold text-white/40 uppercase tracking-wider mb-2.5">Subject Clusters</div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-white/[0.02] ring-1 ring-white/5 p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-white/80">Elder Care</span>
                  <Flame className="w-3 h-3 text-[#e8553f]" />
                </div>
                <p className="text-[9px] text-white/45 leading-relaxed">Safety measures, assistive gear simulations, and mobility layouts.</p>
                <div className="flex justify-between items-center text-[8px] text-white/40 mt-1">
                  <span>24 articles</span>
                  <span className="text-[#28c840]">84% relevance</span>
                </div>
              </div>

              <div className="rounded-lg bg-white/[0.02] ring-1 ring-white/5 p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-white/80">Mobility</span>
                  <CheckCircle className="w-3 h-3 text-white/30" />
                </div>
                <p className="text-[9px] text-white/45 leading-relaxed">EV vehicles, transit routes, wheelchair accessories reviews.</p>
                <div className="flex justify-between items-center text-[8px] text-white/40 mt-1">
                  <span>18 articles</span>
                  <span className="text-[#28c840]">92% relevance</span>
                </div>
              </div>

              <div className="rounded-lg bg-white/[0.02] ring-1 ring-white/5 p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-white/80">Home Safety</span>
                  <CheckCircle className="w-3 h-3 text-white/30" />
                </div>
                <p className="text-[9px] text-white/45 leading-relaxed">LEED materials, lighting optimization, home insulation setups.</p>
                <div className="flex justify-between items-center text-[8px] text-white/40 mt-1">
                  <span>20 articles</span>
                  <span className="text-[#28c840]">78% relevance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Drafting Inbox */}
          <div>
            <div className="text-[9px] font-bold text-white/40 uppercase tracking-wider mb-2 flex justify-between items-center">
              <span>Drafting Inbox</span>
              <span className="text-[8px] text-white/40 normal-case hover:text-white/60 cursor-pointer flex items-center gap-0.5">
                View all inboxes <ArrowRight className="w-2 h-2" />
              </span>
            </div>
            
            <div className="rounded-lg bg-white/[0.02] ring-1 ring-white/5 overflow-hidden">
              <table className="w-full text-left border-collapse text-[9px]">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01] text-white/45">
                    <th className="py-2 px-3 font-medium">QUESTION / INTENT</th>
                    <th className="py-2 px-3 font-medium">EST. VOLUME</th>
                    <th className="py-2 px-3 font-medium">DIFFICULTY</th>
                    <th className="py-2 px-3 font-medium">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/75">
                  <tr>
                    <td className="py-2 px-3">What are the best falls prevention exercises?</td>
                    <td className="py-2 px-3">22,400/mo</td>
                    <td className="py-2 px-3">Easy</td>
                    <td className="py-2 px-3 text-[#febc2e]/80 font-medium">Drafting</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">How does home insulation affect elder health?</td>
                    <td className="py-2 px-3">8,900/mo</td>
                    <td className="py-2 px-3">Medium</td>
                    <td className="py-2 px-3 text-[#febc2e]/80 font-medium">Drafting</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Best low-carbon mobility aids for travel?</td>
                    <td className="py-2 px-3">14,200/mo</td>
                    <td className="py-2 px-3">Hard</td>
                    <td className="py-2 px-3 text-[#febc2e]/80 font-medium">Drafting</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">LEED checklist requirements for elder care studio?</td>
                    <td className="py-2 px-3">3,200/mo</td>
                    <td className="py-2 px-3">Medium</td>
                    <td className="py-2 px-3 text-[#febc2e]/80 font-medium">Drafting</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Eco-friendly home modifications wheelchair ramp?</td>
                    <td className="py-2 px-3">6,700/mo</td>
                    <td className="py-2 px-3">Easy</td>
                    <td className="py-2 px-3 text-[#febc2e]/80 font-medium">Drafting</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default DashboardMockup;
