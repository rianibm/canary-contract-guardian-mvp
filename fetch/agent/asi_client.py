"""
ASI:One Client for enhanced AI responses in Canary Contract Guardian
"""

import json
import logging
import aiohttp
from typing import Dict, Optional

logger = logging.getLogger("CanaryAgent")

class ASIOneClient:
    """Client for ASI:One model integration"""
    
    def __init__(self, api_endpoint: str, api_key: str = ""):
        self.api_endpoint = api_endpoint
        self.api_key = api_key
        self.session = None
        self.model_name = "asi1-mini"  # Default ASI:One model
    
    async def get_session(self):
        """Get or create aiohttp session"""
        if self.session is None:
            headers = {}
            if self.api_key:
                headers["Authorization"] = f"Bearer {self.api_key}"
                headers["Content-Type"] = "application/json"
            
            self.session = aiohttp.ClientSession(headers=headers)
        return self.session
    
    async def close_session(self):
        """Close the aiohttp session"""
        if self.session:
            await self.session.close()
            self.session = None
    
    async def generate_enhanced_response(self, user_message: str, context: Dict = None) -> Optional[str]:
        """Generate enhanced response using ASI:One model API"""
        try:
            # If no API key provided, fall back to smart local responses
            if not self.api_key or not self.api_endpoint:
                logger.info("No ASI:One API key provided, using smart local responses")
                return await self._generate_smart_response(user_message, context)
            
            session = await self.get_session()
            
            # Prepare context for the AI model
            system_prompt = self._build_system_prompt()
            
            # If context provided, append it to the system prompt
            if context:
                context_str = f"\n\nAdditional context: {json.dumps(context, indent=2)}"
                system_prompt += context_str
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ]
            
            # Prepare API request payload
            payload = {
                "model": self.model_name,
                "messages": messages,
                "max_tokens": 500,
                "temperature": 0.7,
                "top_p": 0.9
            }
            
            logger.debug(f"Sending request to ASI:One API: {self.api_endpoint}")
            
            # Make API call to ASI:One
            async with session.post(
                f"{self.api_endpoint}/chat/completions",
                json=payload,
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                
                if response.status == 200:
                    result = await response.json()
                    
                    # Extract response from ASI:One API format
                    if "choices" in result and len(result["choices"]) > 0:
                        ai_response = result["choices"][0]["message"]["content"]
                        logger.info("✅ ASI:One API response received")
                        logger.debug(f"ASI:One raw response: {ai_response[:200]}...")  # Log first 200 chars
                        return ai_response.strip()
                    else:
                        logger.warning("Invalid response format from ASI:One API")
                        logger.debug(f"Full ASI response: {result}")
                        return await self._generate_smart_response(user_message, context)
                
                elif response.status == 401:
                    logger.error("ASI:One API authentication failed - check API key")
                    return await self._generate_smart_response(user_message, context)
                
                elif response.status == 429:
                    logger.warning("ASI:One API rate limit exceeded")
                    return await self._generate_smart_response(user_message, context)
                
                else:
                    logger.error(f"ASI:One API error: {response.status}")
                    error_text = await response.text()
                    logger.error(f"Error details: {error_text}")
                    
                    # For 400 errors, also log the request payload to debug
                    if response.status == 400:
                        logger.error(f"Request payload that caused 400: {json.dumps(payload, indent=2)}")
                    
                    return await self._generate_smart_response(user_message, context)
            
        except aiohttp.ClientTimeout:
            logger.warning("ASI:One API timeout, falling back to local response")
            return await self._generate_smart_response(user_message, context)
        
        except (aiohttp.ClientError, ConnectionError) as e:
            logger.error(f"ASI:One API client error: {e}")
            return await self._generate_smart_response(user_message, context)
        
        except Exception as e:
            logger.error(f"Unexpected error with ASI:One API: {e}")
            return await self._generate_smart_response(user_message, context)
    
    def _build_system_prompt(self) -> str:
        """Build system prompt for ASI:One model"""
        return """You are Canary Contract Guardian, an expert AI-powered smart contract security monitor specialized in blockchain security and Internet Computer Protocol (ICP) contracts.

Your expertise includes:
- Real-time contract monitoring and threat detection
- Security vulnerability analysis and risk assessment  
- Balance drop detection with adaptive thresholds
- Ownership change monitoring and governance attacks
- Cross-rule correlation for complex attack patterns
- Gas/cycles usage anomaly detection
- Reentrancy and flash loan attack identification
- MEV exploitation and price manipulation detection

Communication style:
- Provide technical, actionable security insights
- Use clear explanations with specific recommendations
- Include risk levels (WARNING, DANGER, CRITICAL) when relevant
- Focus on practical security measures users can take
- Be concise but comprehensive in threat analysis

When monitoring contracts, explain:
1. What specific threats you're watching for
2. Why each monitoring rule is important
3. What actions users should take when alerts trigger
4. How different attack vectors can be correlated

Always prioritize security and provide context-aware recommendations based on the specific contract situation."""

    async def _generate_smart_response(self, user_message: str, context: Dict = None) -> str:
        """Generate intelligent local response when ASI:One API is unavailable"""
        message_lower = user_message.lower()
        
        # Enhanced local AI-style responses based on security expertise
        if "monitor" in message_lower and "contract" in message_lower:
            return """🔒 **Smart Contract Monitoring Initiated**

I'll establish comprehensive surveillance with these security layers:

**Core Monitoring Rules:**
• **Balance Monitoring**: Track for >50% drops with adaptive thresholds based on 5-point history
• **Ownership Surveillance**: CRITICAL alerts for any permission/admin changes  
• **Transaction Analysis**: Monitor volume spikes and suspicious patterns
• **Gas Analysis**: Detect 3× normal usage indicating potential exploits

**Advanced Detection:**
• **Cross-Rule Correlation**: Identify complex attacks (e.g., balance drop + ownership change)
• **Reentrancy Patterns**: Recursive call detection within 60-second windows
• **Flash Loan Monitoring**: Large borrows followed by rapid transaction chains

**Security Recommendation**: Enable Discord notifications for real-time alerts. My correlation engine will detect sophisticated multi-vector attacks that single rules might miss."""

        elif "check" in message_lower and ("contract" in message_lower or "security" in message_lower):
            return """🔍 **Comprehensive Security Analysis**

Performing multi-layer contract assessment:

**Static Analysis:**
• Function permissions & access control validation
• Admin function exposure and upgrade mechanisms
• Critical function call patterns

**Behavioral Analysis:**
• Recent transaction patterns and volume trends
• Gas usage patterns vs. historical median
• Unusual timing or frequency patterns

**Temporal Correlation:**
• Recent ownership/admin changes within 10-minute windows
• Balance fluctuations correlating with admin activities
• Cross-referencing with known attack vector signatures

**Risk Assessment**: I analyze both current state and historical patterns to identify subtle vulnerabilities that traditional single-rule monitoring might miss. Each finding includes specific remediation steps."""

        elif "balance" in message_lower and ("drop" in message_lower or "alert" in message_lower):
            return """⚠️ **Balance Drop Analysis & Response Guide**

**When Balance Drops Detected:**

**Immediate Actions:**
1. **Verify Legitimacy**: Check if drop correlates with planned withdrawals/distributions
2. **Check Ownership**: Scan for recent admin/ownership changes (high-risk correlation)
3. **Review Recent Transactions**: Look for unusual large transfers or unknown recipients
4. **Gas Pattern Analysis**: Unusual gas usage often indicates exploit attempts

**Risk Escalation Matrix:**
• **WARNING**: >50% drop with normal ownership/admin state
• **DANGER**: >3× median drop OR ownership changes detected
• **CRITICAL**: Balance drop + ownership change within 10-minute window

**Advanced Protection**: My adaptive threshold system learns from your contract's normal patterns. A 50% drop might be normal for some contracts but catastrophic for others."""

        elif "ownership" in message_lower or "admin" in message_lower:
            return """🚨 **Ownership & Admin Security Intelligence**

**Critical Threat Vector**: Ownership changes are among the most dangerous attack vectors.

**What I Monitor:**
• **Permission Transfers**: Any change in contract ownership/admin roles
• **Access Control**: New addresses gaining elevated permissions  
• **Upgrade Events**: Contract upgrade attempts or migrations
• **Multi-sig Changes**: Modifications to required signatures

**High-Risk Patterns:**
• **Governance Attacks**: Ownership changes during market stress
• **Social Engineering**: Gradual permission escalation over time
• **Exploit Preparation**: Admin changes followed by balance manipulation

**CRITICAL Correlation**: Ownership change + balance drop within 10 minutes = Maximum threat level. This pattern indicates potential contract compromise or insider attack.

**Immediate Response**: Pause contract operations if possible, verify all recent admin transactions, and assess if changes were authorized."""

        elif "gas" in message_lower or "cycles" in message_lower:
            return """⛽ **Gas/Cycles Usage Intelligence**

**Why Gas Monitoring Matters:**
Gas anomalies often signal attack attempts before they succeed.

**Detection Methodology:**
• **Baseline Learning**: Track median gas usage over 10 data points
• **Anomaly Threshold**: Alert when usage >3× historical median
• **Pattern Recognition**: Identify exploitation signatures

**Common Attack Signatures:**
• **Reentrancy**: Repeated high-gas function calls in rapid succession
• **Flash Loans**: Sudden gas spikes during large borrowing operations
• **MEV Exploitation**: Unusual gas bidding patterns
• **DoS Attempts**: Abnormally high gas consumption to drain resources

**Adaptive Intelligence**: My system learns your contract's normal gas patterns and adjusts thresholds accordingly. What's normal for a DEX differs from a simple token contract."""

        elif "flash" in message_lower and "loan" in message_lower:
            return """💥 **Flash Loan Attack Detection System**

**Attack Pattern Recognition:**
Flash loans enable complex attacks by providing instant capital without collateral.

**Detection Signatures:**
• **Large Borrowing**: Loans >1M tokens triggering monitoring
• **Rapid Execution**: Multiple transactions within 5-minute windows post-loan
• **Price Manipulation**: Coordinated trading to manipulate oracle prices
• **Arbitrage Exploitation**: Cross-protocol value extraction

**Multi-Step Attack Chain:**
1. Flash loan large amount
2. Manipulate token price via trades
3. Exploit price oracle dependency  
4. Extract value through arbitrage
5. Repay loan + profit

**Defense Strategy**: I correlate borrowing events with subsequent transaction patterns and price movements to detect coordinated attacks before major damage occurs."""

        elif "reentrancy" in message_lower:
            return """🔄 **Reentrancy Attack Detection Engine**

**Attack Mechanism:**
Exploits contract functions that make external calls before updating internal state.

**Detection Pattern:**
• **Recursive Calls**: Same function called ≥3 times within 60 seconds
• **State Inconsistency**: Balance/state changes during call execution
• **Gas Patterns**: Repeated high-gas consumption in tight loops
• **Call Depth**: Unusual function call nesting levels

**Famous Example**: The DAO hack used reentrancy to drain 3.6M ETH.

**Protection Logic**: I monitor call patterns and detect when functions are being called recursively in suspicious patterns. Each detection includes the specific function involved and recommended immediate actions."""

        elif "correlation" in message_lower or "cross-rule" in message_lower:
            return """🧠 **Cross-Rule Correlation Intelligence**

**Advanced Threat Detection:**
Single alerts might be false positives, but correlated events indicate real threats.

**Correlation Patterns I Monitor:**
• **Balance Drop + Ownership Change** = CRITICAL (potential takeover)
• **High Gas + Flash Loan** = Major exploit attempt
• **Admin Changes + Transaction Spikes** = Coordinated attack
• **Price Manipulation + Large Withdrawals** = Market manipulation

**Time Window Analysis:**
• **10-minute correlation window** for related events
• **Historical pattern matching** against known attack signatures
• **Adaptive threshold adjustment** based on contract behavior

**Intelligence Advantage**: Attackers often execute multi-step operations. By correlating seemingly unrelated events, I can detect sophisticated attacks that single-rule monitoring would miss.

**Example**: A 30% balance drop alone might be normal, but combined with an ownership change, it becomes a CRITICAL security incident requiring immediate action."""

        elif "help" in message_lower or "command" in message_lower:
            return """🐦 **Canary Contract Guardian - AI Command Center**

**Core Commands:**
• `monitor contract [ID]` - Initiate comprehensive surveillance
• `check contract [ID]` - Perform security analysis  
• `status` - View all monitored contracts and alerts
• `stop monitoring [ID]` - Cease surveillance

**Security Analysis Commands:**
• `security analysis` - Get current threat landscape
• `explain [attack_type]` - Learn about specific threats
• `correlation analysis` - Understand cross-rule detection

**Advanced Features:**
• **Adaptive Thresholds**: Learn from your contract's normal behavior
• **Cross-Rule Correlation**: Detect complex multi-step attacks
• **AI Recommendations**: Get specific action plans for each alert type
• **Real-time Discord Alerts**: Instant notifications with context

**Expert Tip**: Ask about specific security concerns like "What should I do if ownership changes?" for detailed guidance."""

        else:
            return """🛡️ **AI-Enhanced Contract Security Guardian**

**Welcome to Advanced Contract Protection**

I'm your AI-powered security analyst specializing in Internet Computer smart contracts. My intelligence combines:

**Traditional Monitoring**: Balance drops, transaction volume, function calls
**AI Enhancement**: Pattern recognition, threat correlation, adaptive learning
**Security Expertise**: Deep knowledge of attack vectors and defense strategies

**Key Capabilities:**
• **Multi-Layer Detection**: 8 security rules with intelligent correlation
• **Adaptive Learning**: Thresholds adjust to your contract's behavior patterns
• **Threat Intelligence**: Real-time analysis of emerging attack patterns
• **Actionable Alerts**: Every notification includes specific remediation steps

**Get Started:**
• `monitor contract [ID]` to begin comprehensive surveillance
• `security analysis` for current threat assessment
• `help [topic]` for detailed guidance on any security concern

**Expert Mode**: Ask specific questions about attack types, security patterns, or get personalized recommendations for your contract portfolio."""

    async def test_connection(self) -> bool:
        """Test connection to ASI:One API"""
        try:
            if not self.api_key or not self.api_endpoint:
                logger.info("No ASI:One API credentials configured")
                return False
            
            session = await self.get_session()
            
            # Test with a simple API call
            test_payload = {
                "model": self.model_name,
                "messages": [{"role": "user", "content": "Hello"}],
                "max_tokens": 10
            }
            
            async with session.post(
                f"{self.api_endpoint}/chat/completions",
                json=test_payload,
                timeout=aiohttp.ClientTimeout(total=10)
            ) as response:
                
                if response.status == 200:
                    logger.info("✅ ASI:One API connection successful")
                    return True
                else:
                    logger.warning(f"ASI:One API test failed: {response.status}")
                    return False
                    
        except (aiohttp.ClientError, ConnectionError, OSError) as e:
            logger.error(f"ASI:One API connection test failed: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error testing ASI:One API: {e}")
            return False
