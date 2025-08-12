import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { strategy_name, symbols, start_date, end_date, parameters } = body;

    // Validate required parameters
    if (!strategy_name || !symbols || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'Missing required parameters: strategy_name, symbols, start_date, end_date' },
        { status: 400 }
      );
    }

    // Prepare command line arguments
    const scriptPath = path.join(process.cwd(), 'scripts', 'enhanced_backtesting_cli.py');
    const args = [
      'backtest',
      '--strategy', strategy_name,
      '--symbols', Array.isArray(symbols) ? symbols.join(',') : symbols,
      '--start-date', start_date,
      '--end-date', end_date,
      '--parameters', JSON.stringify(parameters || {})
    ];

    console.log('Running QLib backtesting with:', { strategy_name, symbols, start_date, end_date, parameters });

    // Execute the backtesting script
    const result = await new Promise((resolve, reject) => {
      const child = spawn('python', [scriptPath, ...args], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          try {
            // Clean the stdout to handle NaN and Infinity values
            let cleanedStdout = stdout.trim();
            cleanedStdout = cleanedStdout.replace(/:\s*NaN/g, ': null');
            cleanedStdout = cleanedStdout.replace(/:\s*Infinity/g, ': null');
            cleanedStdout = cleanedStdout.replace(/:\s*-Infinity/g, ': null');
            
            const cliResult = JSON.parse(cleanedStdout);
            
            // Transform CLI result to match frontend expectations
            if (cliResult.success) {
              const transformedResult = {
                success: true,
                data: {
                  success: true,
                  experiment_id: `backtest_${Date.now()}`,
                  strategy_name: cliResult.strategy,
                  symbols: cliResult.symbols,
                  start_date: start_date,
                  end_date: end_date,
                  parameters: parameters || {
                    initial_capital: 100000,
                    commission: 0.001,
                    slippage: 0.0005,
                    position_size: 0.1,
                    max_positions: 10,
                    stop_loss: 0.05,
                    take_profit: 0.15,
                    rebalance_frequency: 'daily'
                  },
                  performance: {
                    total_trades: cliResult.results?.total_trades || 0,
                    winning_trades: 0, // Calculate from results if available
                    losing_trades: 0, // Calculate from results if available
                    win_rate: cliResult.results?.performance?.win_rate || 0,
                    total_pnl: cliResult.results?.total_pnl || 0,
                    total_return: cliResult.results?.performance?.total_return || 0,
                    avg_win: 0, // Calculate from results if available
                    avg_loss: 0, // Calculate from results if available
                    profit_factor: cliResult.results?.performance?.profit_factor || 0,
                    volatility: cliResult.results?.performance?.volatility || 0,
                    sharpe_ratio: cliResult.results?.performance?.sharpe_ratio || 0,
                    max_drawdown: cliResult.results?.performance?.max_drawdown || 0,
                    avg_trade_duration: 0, // Calculate from results if available
                    final_portfolio_value: 0, // Calculate from results if available
                    initial_capital: parameters?.initial_capital || 100000
                  },
                  reports: {
                    summary: cliResult.results?.performance || {},
                    charts: cliResult.report?.charts || {},
                    trades_analysis: {}
                  }
                }
              };
              resolve(transformedResult);
            } else {
              resolve({
                success: false,
                error: cliResult.error || 'Backtest failed'
              });
            }
          } catch (error) {
            console.error('JSON parse error:', error);
            console.error('stdout length:', stdout.length);
            console.error('stdout last 100 chars:', stdout.slice(-100));
            reject(new Error(`Failed to parse output: ${stdout}`));
          }
        } else {
          reject(new Error(`Script failed with code ${code}: ${stderr}`));
        }
      });

      child.on('error', (error) => {
        reject(new Error(`Failed to start script: ${error.message}`));
      });
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('QLib backtesting error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'test') {
      // Test the QLib data reader
      const scriptPath = path.join(process.cwd(), 'scripts', 'test_qlib_backtesting.py');
      
      const result = await new Promise((resolve, reject) => {
        const child = spawn('python', [scriptPath], {
          cwd: process.cwd(),
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        child.on('close', (code) => {
          if (code === 0) {
            resolve({ success: true, output: stdout });
          } else {
            reject(new Error(`Test failed with code ${code}: ${stderr}`));
          }
        });

        child.on('error', (error) => {
          reject(new Error(`Failed to start test: ${error.message}`));
        });
      });

      return NextResponse.json(result);
    }

    // Default: return available strategies and data info
    return NextResponse.json({
      available_strategies: ['momentum', 'mean_reversion'],
      data_source: 'QLib US Stock Data',
      supported_symbols: 'All US stocks available in QLib dataset',
      date_range: '1999-12-31 to 2020-11-10'
    });

  } catch (error) {
    console.error('QLib backtesting GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
