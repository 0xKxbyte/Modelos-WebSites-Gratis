#!/usr/bin/env python3
"""
Sistema de Gerenciamento - Banco de Dados Advocacia
Popula e gerencia o banco de dados do escritório
Requer: pip install mysql-connector-python python-dotenv
"""

import mysql.connector
import hashlib
from datetime import datetime, date
import json

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'db_advocacia',
    'charset': 'utf8mb4'
}

CONTEUDO_BLOG = [
    {
        'titulo': 'Planejamento Sucessório: Protegendo o Futuro da Sua Família',
        'slug': 'planejamento-sucessorio',
        'categoria': 'Direito de Família',
        'resumo': 'Entenda como o planejamento sucessório pode proteger seu patrimônio e garantir tranquilidade para sua família.',
        'conteudo': '''
            <h2>O que é Planejamento Sucessório?</h2>
            <p>O planejamento sucessório é o conjunto de estratégias legais utilizadas para organizar a transferência de bens de uma pessoa para seus herdeiros ainda em vida.</p>
            <h2>Benefícios</h2>
            <ul>
                <li>Redução de custos e impostos</li>
                <li>Agilidade no processo de transferência</li>
                <li>Preservação da harmonia familiar</li>
                <li>Proteção do patrimônio</li>
            </ul>
            <h2>Instrumentos Utilizados</h2>
            <p>Testamento, doação em vida, holding familiar e seguros são alguns dos instrumentos disponíveis.</p>
        '''
    },
    {
        'titulo': 'Reforma Trabalhista: O Que Mudou e Como Impacta Seu Negócio',
        'slug': 'reforma-trabalhista',
        'categoria': 'Direito Trabalhista',
        'resumo': 'Principais alterações da reforma trabalhista e como adequar sua empresa.',
        'conteudo': '''
            <h2>Principais Mudanças</h2>
            <p>A reforma trabalhista (Lei 13.467/2017) trouxe alterações significativas na CLT.</p>
            <h2>Pontos Críticos</h2>
            <ul>
                <li>Terceirização irrestrita</li>
                <li>Jornada intermitente</li>
                <li>Acordo individual sobre banco de horas</li>
                <li>Ultra-atividade dos acordos coletivos</li>
            </ul>
        '''
    },
    {
        'titulo': 'LGPD: Como Adequar Seu Escritório à Nova Lei de Proteção de Dados',
        'slug': 'lgpd-escritorio',
        'categoria': 'Direito Digital',
        'resumo': 'Passos essenciais para adequar seu escritório à Lei Geral de Proteção de Dados.',
        'conteudo': '''
            <h2>O que é a LGPD?</h2>
            <p>A Lei Geral de Proteção de Dados (Lei 13.709/2018) estabelece regras sobre coleta, armazenamento e tratamento de dados pessoais.</p>
            <h2>Medidas Necessárias</h2>
            <ul>
                <li>Mapeamento de dados</li>
                <li>Política de privacidade</li>
                <li>Termos de consentimento</li>
                <li>Segurança da informação</li>
            </ul>
        '''
    },
    {
        'titulo': 'Direito Empresarial: Protegendo Seu Negócio com Contratos Inteligentes',
        'slug': 'contratos-inteligentes',
        'categoria': 'Direito Empresarial',
        'resumo': 'Como contratos bem elaborados podem prevenir conflitos e proteger sua empresa.',
        'conteudo': '''
            <h2>A Importância dos Contratos</h2>
            <p>Contratos são a espinha dorsal de qualquer relação comercial. Um contrato bem elaborado previne conflitos.</p>
            <h2>Cláusulas Essenciais</h2>
            <ul>
                <li>Objeto e escopo</li>
                <li>Formas de pagamento</li>
                <li>Confidencialidade</li>
                <li>Rescisão e multas</li>
            </ul>
        '''
    }
]


def conectar():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except mysql.connector.Error as e:
        print(f"Erro ao conectar: {e}")
        return None


def popular_blog(conn):
    cursor = conn.cursor()
    sql = """INSERT IGNORE INTO blog (titulo, slug, conteudo, resumo, categoria, publicado, data_publicacao)
             VALUES (%s, %s, %s, %s, %s, %s, %s)"""
    for artigo in CONTEUDO_BLOG:
        cursor.execute(sql, (
            artigo['titulo'],
            artigo['slug'],
            artigo['conteudo'],
            artigo['resumo'],
            artigo['categoria'],
            True,
            date.today()
        ))
    conn.commit()
    print(f"Blog populado com {len(CONTEUDO_BLOG)} artigos.")


def gerar_relatorio(conn):
    cursor = conn.cursor(dictionary=True)
    relatorio = {
        'data': datetime.now().isoformat(),
        'total_contatos': 0,
        'contatos_nao_lidos': 0,
        'total_newsletter': 0,
        'total_depoimentos': 0,
        'depoimentos_pendentes': 0,
        'total_artigos': 0,
        'artigos_publicados': 0
    }

    cursor.execute("SELECT COUNT(*) as total FROM contatos")
    relatorio['total_contatos'] = cursor.fetchone()['total']

    cursor.execute("SELECT COUNT(*) as total FROM contatos WHERE lido = FALSE")
    relatorio['contatos_nao_lidos'] = cursor.fetchone()['total']

    cursor.execute("SELECT COUNT(*) as total FROM newsletter WHERE ativo = TRUE")
    relatorio['total_newsletter'] = cursor.fetchone()['total']

    cursor.execute("SELECT COUNT(*) as total FROM depoimentos")
    relatorio['total_depoimentos'] = cursor.fetchone()['total']

    cursor.execute("SELECT COUNT(*) as total FROM depoimentos WHERE aprovado = FALSE")
    relatorio['depoimentos_pendentes'] = cursor.fetchone()['total']

    cursor.execute("SELECT COUNT(*) as total FROM blog")
    relatorio['total_artigos'] = cursor.fetchone()['total']

    cursor.execute("SELECT COUNT(*) as total FROM blog WHERE publicado = TRUE")
    relatorio['artigos_publicados'] = cursor.fetchone()['total']

    with open('relatorio_banco.json', 'w', encoding='utf-8') as f:
        json.dump(relatorio, f, ensure_ascii=False, indent=2)

    print("Relatório gerado: relatorio_banco.json")
    for k, v in relatorio.items():
        if k != 'data':
            print(f"  {k}: {v}")


def exportar_contatos(conn, formato='csv'):
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, nome, email, telefone, assunto, DATE_FORMAT(data_envio, '%%d/%%m/%%Y %%H:%%i') as data FROM contatos ORDER BY data_envio DESC")

    if formato == 'csv':
        with open('contatos_exportados.csv', 'w', encoding='utf-8') as f:
            f.write('ID;Nome;Email;Telefone;Assunto;Data\n')
            for row in cursor:
                f.write(f"{row['id']};{row['nome']};{row['email']};{row['telefone'] or ''};{row['assunto'] or ''};{row['data']}\n")
        print("Contatos exportados para contatos_exportados.csv")
    else:
        with open('contatos_exportados.json', 'w', encoding='utf-8') as f:
            json.dump(list(cursor), f, ensure_ascii=False, indent=2)
        print("Contatos exportados para contatos_exportados.json")


def limpar_dados_antigos(conn, dias=90):
    cursor = conn.cursor()
    sql = "DELETE FROM logs_sistema WHERE data_log < DATE_SUB(NOW(), INTERVAL %s DAY)"
    cursor.execute(sql, (dias,))
    conn.commit()
    print(f"Logs mais antigos que {dias} dias removidos: {cursor.rowcount} registros.")


def verificar_integridade(conn):
    cursor = conn.cursor()
    inconsistencias = []

    tabelas = ['advogados', 'contatos', 'newsletter', 'depoimentos', 'blog']
    for tabela in tabelas:
        cursor.execute(f"SELECT COUNT(*) FROM {tabela}")
        count = cursor.fetchone()[0]
        print(f"  {tabela}: {count} registros")

    cursor.execute("""
        SELECT c.id FROM contatos c
        LEFT JOIN advogados a ON 1=1
        WHERE c.email NOT LIKE '%@%'
    """)
    for row in cursor:
        inconsistencias.append(f"Contato {row[0]} com email inválido")

    if inconsistencias:
        print("Inconsistências encontradas:")
        for i in inconsistencias:
            print(f"  - {i}")
    else:
        print("Nenhuma inconsistência encontrada.")


def main():
    print("=" * 60)
    print("Sistema de Gerenciamento - Banco de Dados Advocacia")
    print("=" * 60)

    conn = conectar()
    if not conn:
        print("Não foi possível conectar ao banco de dados.")
        return

    print(f"Conectado ao banco 'db_advocacia' em {DB_CONFIG['host']}")

    while True:
        print("\n--- MENU ---")
        print("1. Popular banco com dados iniciais")
        print("2. Gerar relatório completo")
        print("3. Exportar contatos (CSV)")
        print("4. Exportar contatos (JSON)")
        print("5. Limpar logs antigos (90 dias)")
        print("6. Verificar integridade dos dados")
        print("7. Executar tudo")
        print("0. Sair")

        opcao = input("\nEscolha: ").strip()

        if opcao == '1':
            popular_blog(conn)
        elif opcao == '2':
            gerar_relatorio(conn)
        elif opcao == '3':
            exportar_contatos(conn, 'csv')
        elif opcao == '4':
            exportar_contatos(conn, 'json')
        elif opcao == '5':
            limpar_dados_antigos(conn)
        elif opcao == '6':
            verificar_integridade(conn)
        elif opcao == '7':
            popular_blog(conn)
            gerar_relatorio(conn)
            exportar_contatos(conn, 'csv')
            verificar_integridade(conn)
            print("\nTodas as operações concluídas.")
        elif opcao == '0':
            break

    conn.close()
    print("Conexão encerrada.")


if __name__ == '__main__':
    main()
