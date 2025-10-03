import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Wifi
} from "lucide-react";

export function FinancialDashboard() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Income & Expenses */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border shadow-lg h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-white text-lg font-semibold">Income & Expenses</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Month</span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                {/* Circular Progress Chart - Exact match to reference with blob shape */}
                <div className="relative w-64 h-64 mb-6 flex items-center justify-center">
                  {/* Blob-shaped background with gradients */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-56 h-56">
                      {/* Animated blob shape with multiple gradient layers */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 via-teal-500 to-blue-500 opacity-20 blur-sm animate-pulse"></div>
                      <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-green-400 opacity-30 blur-md"></div>
                      <div className="absolute inset-4 rounded-full bg-gradient-to-bl from-teal-400 via-green-500 to-blue-600 opacity-25 blur-lg"></div>
                      
                      {/* Inner dark circle */}
                      <div className="absolute inset-8 rounded-full bg-gray-900 border-4 border-gray-800 shadow-2xl flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-white mb-1">$1,562.00</div>
                          <div className="flex items-center justify-center text-green-400 text-sm">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            <span className="font-semibold">+14%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <ArrowDownRight className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">Income</span>
                    <span className="text-sm font-semibold text-white">+ $4,265.00</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-muted-foreground">Outcome</span>
                    <span className="text-sm font-semibold text-white">- $645.00</span>
                  </div>
                </div>

                {/* Expense Categories */}
                <div className="w-full space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      </div>
                      <span className="text-sm text-muted-foreground">Sport</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-muted-foreground">July</span>
                      <div className="text-sm font-semibold text-white">$321.47</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-500/20 rounded-lg flex items-center justify-center">
                        <div className="w-4 h-4 bg-gray-500 rounded"></div>
                      </div>
                      <span className="text-sm text-muted-foreground">Car Repair</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-muted-foreground">July</span>
                      <div className="text-sm font-semibold text-white">$210.03</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <div className="w-4 h-4 bg-purple-500 rounded"></div>
                      </div>
                      <span className="text-sm text-muted-foreground">Education</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-muted-foreground">July</span>
                      <div className="text-sm font-semibold text-white">$554.12</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Investment Section */}
            <Card className="bg-card border-border shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-lg font-semibold">Investment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">ETH</span>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">ETH/USD</div>
                      <div className="text-lg font-bold text-white">$4,124.00</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-red-500 text-sm">
                      <TrendingDown className="h-4 w-4 mr-1" />
                      <span>-2.4%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">BTC</span>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">BTC/USD</div>
                      <div className="text-lg font-bold text-white">$7,124.00</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-green-500 text-sm">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span>+1.2%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Send Money Section */}
            <Card className="bg-card border-border shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-lg font-semibold">Send money to</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                  <Button variant="ghost" size="sm" className="w-10 h-10 rounded-full border-2 border-dashed border-muted-foreground">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">VISA</span>
                      <span className="text-muted-foreground">**** 2233</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Enter the amount</label>
                    <div className="text-4xl font-bold text-white">$266</div>
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Send money
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* My Cards Section */}
            <Card className="bg-card border-border shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-white text-lg font-semibold">My cards</CardTitle>
                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* VISA Card - Glassy effect with cyan-black gradient */}
                  <div className="relative rounded-2xl p-6 text-white overflow-hidden shadow-2xl min-h-[200px] backdrop-blur-xl border border-white/10">
                    {/* Glassy background with cyan-black gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-blue-500/30 to-black/80 rounded-2xl"></div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 rounded-2xl"></div>
                    
                    {/* Content layer */}
                    <div className="relative z-10">
                      {/* Card Header */}
                      <div className="flex justify-between items-start mb-16">
                        <div className="text-2xl font-bold tracking-wider">VISA</div>
                        <Wifi className="h-6 w-6 opacity-80" />
                      </div>
                      
                      {/* Card Number - positioned lower */}
                      <div className="mb-4">
                        <div className="text-xl font-mono tracking-[0.3em] font-medium">•••• 2233</div>
                      </div>
                      
                      {/* Expiry Date - simple layout */}
                      <div className="mb-0">
                        <div className="text-sm font-medium opacity-90">07 / 2023</div>
                      </div>
                    </div>
                    
                    {/* Glassy shine effect */}
                    <div className="absolute top-0 left-0 w-full h-full">
                      <div className="absolute top-4 left-4 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
                      <div className="absolute bottom-4 right-4 w-24 h-24 bg-cyan-400/10 rounded-full blur-lg"></div>
                    </div>
                    
                    {/* Glass reflection */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl"></div>
                  </div>
                  
                  {/* Navigation arrows */}
                  <div className="flex justify-between items-center mt-4 px-2">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-muted-foreground/30 rounded-full"></div>
                      <div className="w-2 h-2 bg-muted-foreground/30 rounded-full"></div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Balance Display */}
                <div className="text-center mt-8">
                  <div className="text-4xl font-bold text-white">$8,244.00</div>
                  <div className="text-sm text-muted-foreground mt-1">Available Balance</div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card className="bg-card border-border shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-lg font-semibold">Recent Activities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xs">S</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Spotify</div>
                      <div className="text-xs text-muted-foreground">1 month</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-white">-$24.00</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xs">D</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Spotify</div>
                      <div className="text-xs text-muted-foreground">1 month</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-white">-$78.12</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xs">N</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Nike</div>
                      <div className="text-xs text-muted-foreground">2 days</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-white">-$50.00</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
