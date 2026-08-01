#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sistema de Seguranca para TechStore Pro
Modulos: Protecao contra ataques, validacao, firewall
"""

import re
import os
import json
import hashlib
import hmac
import secrets
import ipaddress
from datetime import datetime, timedelta
from pathlib import Path


class SecurityManager:
    def __init__(self):
        self.blocked_ips = set()
        self.rate_limit = {}
        self.sql_injection_patterns = [
            r"(\bSELECT\b.*\bFROM\b)",
            r"(\bINSERT\b.*\bINTO\b)",
            r"(\bUPDATE\b.*\bSET\b)",
            r"(\bDELETE\b.*\bFROM\b)",
            r"(\bDROP\b.*\bTABLE\b)",
            r"(\bUNION\b.*\bSELECT\b)",
            r"(\bOR\b.*\b1=1\b)",
            r"(\b--\b)",
            r"(\b#\b)",
            r"(\b\/\*.*\*\/\b)",
        ]
        self.xss_patterns = [
            r"(<script.*?>.*?<\/script>)",
            r"(on\w+\s*=)",
            r"(javascript\s*:)",
            r"(<iframe.*?>.*?<\/iframe>)",
            r"(<embed.*?>.*?<\/embed>)",
            r"(<object.*?>.*?<\/object>)",
        ]

    def sanitize_input(self, value):
        if isinstance(value, str):
            value = value.strip()
            value = re.sub(r"[<>\"'%()&+]", "", value)
            return value[:1000]
        return value

    def detect_sql_injection(self, value):
        if isinstance(value, str):
            for pattern in self.sql_injection_patterns:
                if re.search(pattern, value, re.IGNORECASE):
                    return True
        return False

    def detect_xss(self, value):
        if isinstance(value, str):
            for pattern in self.xss_patterns:
                if re.search(pattern, value, re.IGNORECASE):
                    return True
        return False

    def check_rate_limit(self, ip, endpoint, max_requests=60, window_seconds=60):
        key = f"{ip}:{endpoint}"
        now = datetime.now()

        if key not in self.rate_limit:
            self.rate_limit[key] = {"count": 1, "start": now}
            return True

        data = self.rate_limit[key]
        elapsed = (now - data["start"]).total_seconds()

        if elapsed > window_seconds:
            self.rate_limit[key] = {"count": 1, "start": now}
            return True

        data["count"] += 1
        if data["count"] > max_requests:
            return False

        return True

    def generate_csrf_token(self):
        return secrets.token_hex(32)

    def validate_csrf_token(self, token, stored_token):
        return hmac.compare_digest(token, stored_token)

    def hash_password(self, password):
        salt = os.urandom(32)
        key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 150000)
        return salt.hex() + ":" + key.hex()

    def verify_password(self, password, stored_hash):
        salt_hex, key_hex = stored_hash.split(":")
        salt = bytes.fromhex(salt_hex)
        stored_key = bytes.fromhex(key_hex)
        new_key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 150000)
        return hmac.compare_digest(new_key, stored_key)

    def is_ip_blocked(self, ip):
        return ip in self.blocked_ips

    def block_ip(self, ip, duration_minutes=30):
        self.blocked_ips.add(ip)

    def validate_cep(self, cep):
        cep = re.sub(r"[^0-9]", "", str(cep))
        return len(cep) == 8

    def validate_email(self, email):
        pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        return bool(re.match(pattern, email)) and len(email) <= 254

    def sanitize_filename(self, filename):
        filename = re.sub(r"[^\w\s.-]", "", filename)
        filename = re.sub(r"\s+", "_", filename)
        return filename[:255]

    def validate_file_upload(self, filename, filesize, allowed_types=None):
        if allowed_types is None:
            allowed_types = {"image/jpeg", "image/png", "image/webp", "image/svg+xml"}
        ext = Path(filename).suffix.lower()
        if ext not in {".jpg", ".jpeg", ".png", ".webp", ".svg"}:
            return False
        if filesize > 10 * 1024 * 1024:
            return False
        return True


class Firewall:
    def __init__(self):
        self.rules = []

    def add_rule(self, rule_type, pattern, action="block"):
        self.rules.append({"type": rule_type, "pattern": pattern, "action": action})

    def check_request(self, ip, path, headers, body=""):
        for rule in self.rules:
            if rule["type"] == "ip" and ipaddress.ip_address(ip) in ipaddress.ip_network(rule["pattern"]):
                return rule["action"]
            if rule["type"] == "path" and re.search(rule["pattern"], path):
                return rule["action"]
            if rule["type"] == "header" and rule["pattern"] in str(headers):
                return rule["action"]
            if rule["type"] == "body" and re.search(rule["pattern"], body):
                return rule["action"]
        return "allow"


class AISearch:
    def __init__(self):
        self.cache = {}
        self.cache_ttl = timedelta(hours=1)

    def tokenize(self, text):
        text = text.lower()
        text = re.sub(r"[^\w\s]", " ", text)
        tokens = text.split()
        stopwords = {
            "de", "da", "do", "das", "dos", "em", "para", "com", "um", "uma",
            "uns", "umas", "o", "a", "os", "as", "e", "ou", "que", "nao",
            "voce", "seu", "sua", "mais", "mas", "por", "no", "na", "nos",
        }
        return [t for t in tokens if t not in stopwords and len(t) > 1]

    def calculate_relevance(self, query_tokens, product_name, product_desc):
        name_tokens = self.tokenize(product_name)
        desc_tokens = self.tokenize(product_desc)

        score = 0
        for token in query_tokens:
            name_count = sum(1 for t in name_tokens if t.startswith(token))
            desc_count = sum(1 for t in desc_tokens if t.startswith(token))
            score += name_count * 3 + desc_count

        name_match = any(t in " ".join(name_tokens) for t in query_tokens)
        if name_match:
            score *= 2

        return score

    def search(self, query, products, limit=10):
        cache_key = query.lower().strip()
        if cache_key in self.cache:
            cached = self.cache[cache_key]
            if datetime.now() - cached["time"] < self.cache_ttl:
                return cached["results"]

        query_tokens = self.tokenize(query)
        if not query_tokens:
            return []

        scored_products = []
        for product in products:
            relevance = self.calculate_relevance(
                query_tokens, product["nome"], product["descricao"]
            )
            if relevance > 0:
                price = product.get("preco_promocional") or product["preco"]
                scored_products.append(
                    {"product": product, "relevance": relevance, "price": price}
                )

        scored_products.sort(key=lambda x: (-x["relevance"], x["price"]))
        results = [sp["product"] for sp in scored_products[:limit]]

        self.cache[cache_key] = {"results": results, "time": datetime.now()}
        return results


if __name__ == "__main__":
    security = SecurityManager()
    ai_search = AISearch()

    test_products = [
        {"id": 1, "nome": "PC Gamer Titan X", "descricao": "PC Gamer de alta performance com Intel Core i9 e RTX 4090", "preco": 13999.99},
        {"id": 2, "nome": "Notebook UltraBook Pro 15", "descricao": "Notebook ultrafino com tela 4K OLED", "preco": 7799.99},
        {"id": 3, "nome": "RTX 5090 Phantom", "descricao": "Placa de video NVIDIA GeForce RTX 5090 32GB GDDR7", "preco": 11999.99},
    ]

    results = ai_search.search("placa de video rtx", test_products)
    print(json.dumps(results, indent=2, ensure_ascii=False))

    print(f"SQL Injection test: {security.detect_sql_injection('1 OR 1=1')}")
    print(f"XSS test: {security.detect_xss('<script>alert(1)</script>')}")
    print(f"Email test: {security.validate_email('teste@email.com')}")
    print(f"CEP test: {security.validate_cep('01001000')}")
