import requests
import logging
from datetime import datetime
from typing import Dict

class DiscordNotifier:
    def __init__(self, webhook_url: str):
        self.webhook_url = webhook_url
    
    async def send_alert(self, alert_data: Dict) -> bool:
        try:
            embed = {
                "title": f"🚨 {alert_data['title']}",
                "description": alert_data['description'],
                "color": self._get_color(alert_data['severity']),
                "timestamp": datetime.utcnow().isoformat(),
                "fields": [
                    {"name": "Contract", "value": f"`{alert_data['contract_address']}`", "inline": True},
                    {"name": "Severity", "value": alert_data['severity'].title(), "inline": True},
                    {"name": "Rule", "value": alert_data['rule_name'], "inline": True},
                    {"name": "🤖 Recommendation", "value": alert_data.get('recommendation', 'No recommendation available'), "inline": False}
                ],
                "footer": {
                    "text": "Canary Contract Guardian",
                    "icon_url": "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Bird/3D/bird_3d.png"
                }
            }
            payload = {"username": "Canary Guardian", "embeds": [embed]}
            response = requests.post(self.webhook_url, json=payload, timeout=10)
            if response.status_code == 204:
                logging.info(f"Discord alert sent successfully: {alert_data['title']}")
                return True
            else:
                logging.error(f"Discord webhook failed: {response.status_code}")
                return False
        except Exception as e:
            logging.error(f"Error sending Discord alert: {e}")
            return False
    def _get_color(self, severity: str) -> int:
        colors = {"danger": 0xDC2626, "warning": 0xF59E0B, "info": 0x3B82F6}
        return colors.get(severity, 0x6B7280)
