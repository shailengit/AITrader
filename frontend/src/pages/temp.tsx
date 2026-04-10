                  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {results.map((result, index) => (
                      <motion.div
                        key={result.ticker}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-[#1c1c1e] rounded-3xl p-6 hover:bg-[#2c2c2e] transition-colors"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-2xl font-bold text-white">{result.ticker}</h3>
                            {result.signal && (
                              <span className="text-base text-[#2997ff]">{result.signal}</span>
                            )}
                          </div>
                          <TrendingUp className="w-6 h-6 text-white/40" />
                        </div>

                        {result.close && (
                          <p className="text-3xl font-bold text-white mb-4">
                            ${result.close.toFixed(2)}
                          </p>
                        )}

                        {result.fundamental_catalyst && (
                          <div className="mb-4 p-4 bg-[#0071e3]/10 rounded-xl">
                            <p className="text-base text-[#2997ff]">{result.fundamental_catalyst}</p>
                          </div>
                        )}

                        {(result.sma_20 || result.rsi) && (
                          <div className="grid grid-cols-2 gap-4 text-base">
                            {result.sma_20 && (
                              <div className="text-white/60">
                                <span className="text-white/40 block text-sm mb-1">SMA(20)</span>
                                <span className="text-white font-bold">{result.sma_20.toFixed(2)}</span>
                              </div>
                            )}
                            {result.rsi && (
                              <div className="text-white/60">
                                <span className="text-white/40 block text-sm mb-1">RSI</span>
                                <span className="text-white font-bold">{result.rsi.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-sm text-white/40">
                          <BarChart2 className="w-5 h-5" />
                          <span>Technical + Fundamental</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
