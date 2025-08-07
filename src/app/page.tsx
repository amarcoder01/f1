'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vidality Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your US stock trading activity.
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Live Data
        </Badge>
      </div>

      {/* Simple Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$125,430.50</div>
            <p className="text-xs text-muted-foreground">+2.34% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Active positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Watchlists</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Active watchlists</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Today's Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Trades executed</p>
          </CardContent>
        </Card>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Gainers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">AAPL</p>
                  <p className="text-sm text-muted-foreground">Apple Inc.</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$185.50</p>
                  <p className="text-sm text-green-500">+2.34%</p>
                </div>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">TSLA</p>
                  <p className="text-sm text-muted-foreground">Tesla Inc.</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$245.20</p>
                  <p className="text-sm text-green-500">+1.89%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Losers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">META</p>
                  <p className="text-sm text-muted-foreground">Meta Platforms</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$320.40</p>
                  <p className="text-sm text-red-500">-1.23%</p>
                </div>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">NFLX</p>
                  <p className="text-sm text-muted-foreground">Netflix Inc.</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$485.60</p>
                  <p className="text-sm text-red-500">-0.89%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}