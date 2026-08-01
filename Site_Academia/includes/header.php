<?php
$current_page = basename($_SERVER['SCRIPT_NAME']);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="IRON GYM - A academia mais completa da cidade. Musculacao, crossfit, funcional e muito mais. Venha transformar seu corpo!">
    <meta name="keywords" content="academia, musculacao, crossfit, fitness, treino, iron gym">
    <meta name="author" content="Iron Gym">
    <meta name="theme-color" content="#0a0a0a">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="css/style.css">
    <title>IRON GYM - <?php echo $page_title ?? 'Academia Profissional'; ?></title>
</head>
<body>

<!-- Preloader -->
<div id="preloader">
    <div class="loader"></div>
</div>

<!-- Particles Canvas -->
<canvas id="particles-canvas"></canvas>

<!-- Header -->
<header class="header">
    <div class="header-inner">
        <a href="index.php" class="logo">
            <svg class="logo-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="18" width="8" height="12" rx="2" fill="#0066ff"/>
                <rect x="36" y="18" width="8" height="12" rx="2" fill="#0066ff"/>
                <rect x="14" y="8" width="6" height="32" rx="3" fill="#ffffff"/>
                <rect x="28" y="8" width="6" height="32" rx="3" fill="#ffffff"/>
                <rect x="8" y="8" width="32" height="6" rx="3" fill="#ffffff"/>
                <rect x="8" y="34" width="32" height="6" rx="3" fill="#ffffff"/>
                <circle cx="24" cy="24" r="4" fill="#0066ff"/>
            </svg>
            <div class="logo-text">IRON <span>GYM</span></div>
        </a>
        <nav class="nav">
            <a href="index.php" class="<?php echo $current_page == 'index.php' ? 'active' : ''; ?>">Home</a>
            <a href="sobre.php" class="<?php echo $current_page == 'sobre.php' ? 'active' : ''; ?>">Sobre</a>
            <a href="horarios.php" class="<?php echo $current_page == 'horarios.php' ? 'active' : ''; ?>">Horarios</a>
            <a href="contato.php" class="<?php echo $current_page == 'contato.php' ? 'active' : ''; ?>">Contato</a>
            <a href="contato.php" class="cta-btn">Matricule-se</a>
        </nav>
        <button class="hamburger" aria-label="Menu">
            <span></span>
            <span></span>
            <span></span>
        </button>
    </div>
</header>

<!-- Timer Bar -->
<div class="timer-bar">
    <div class="timer-inner">
        <span class="timer-label"><strong>PROMOCAO FORTE</strong> &mdash; tempo limitado</span>
        <div class="timer-display">
            <div class="timer-block">
                <span class="num" id="timer-hours">24</span>
                <span class="label">Horas</span>
            </div>
            <span class="timer-sep">:</span>
            <div class="timer-block">
                <span class="num" id="timer-minutes">59</span>
                <span class="label">Minutos</span>
            </div>
            <span class="timer-sep">:</span>
            <div class="timer-block">
                <span class="num" id="timer-seconds">59</span>
                <span class="label">Segundos</span>
            </div>
        </div>
    </div>
</div>

<div class="main-content">
