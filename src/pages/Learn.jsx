import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { runJavaScript, runPython, isPyodideReady } from "../utils/codeRunner";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "@monaco-editor/react";
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Code2,
  Flame,
  HelpCircle,
  Keyboard,
  Lock,
  RefreshCcw,
  Sparkles,
  TerminalSquare,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";

const LANGUAGES = {
  javascript: {
    label: "JavaScript",
    extension: "js",
    monacoLang: "javascript",
    starterComment: "// Écris ton code ici",
    accent: "#f7df1e",
    dot: "bg-yellow-400",
    badge: "bg-yellow-400/10 text-yellow-300 border-yellow-400/20",
  },
  python: {
    label: "Python",
    extension: "py",
    monacoLang: "python",
    starterComment: "# Écris ton code ici",
    accent: "#4aaeff",
    dot: "bg-sky-400",
    badge: "bg-sky-400/10 text-sky-300 border-sky-400/20",
  },
  java: {
    label: "Java",
    extension: "java",
    monacoLang: "java",
    starterComment: "// Écris ton code ici",
    accent: "#f89820",
    dot: "bg-orange-400",
    badge: "bg-orange-400/10 text-orange-300 border-orange-400/20",
  },
  c: {
    label: "C",
    extension: "c",
    monacoLang: "c",
    starterComment: "// Écris ton code ici",
    accent: "#a8b9cc",
    dot: "bg-slate-400",
    badge: "bg-slate-400/10 text-slate-300 border-slate-400/20",
  },
  lua: {
    label: "Lua",
    extension: "lua",
    monacoLang: "lua",
    starterComment: "-- Écris ton code ici",
    accent: "#818cf8",
    dot: "bg-emerald-400",
    badge: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
  },
};

const LEVELS = [
  {
    id: 1,
    title: "Hello World",
    concept: "Sortie console",
    pedagogy:
      "Premier contact avec un langage : afficher un message est le rituel d'initiation universel du développeur.",
    task: 'Affiche le texte exact : "Hello, World!"',
    hint: "Cherche la fonction standard d'affichage de ton langage, comme console.log ou print.",
    explanation:
      "Cette étape enseigne la syntaxe minimale pour produire une sortie. C'est la brique de base avant les variables et la logique.",
    expectedOutput: "Hello, World!",
    acceptedByLanguage: {
      javascript: ['console.log("Hello, World!")', "console.log('Hello, World!')"],
      python: ['print("Hello, World!")', "print('Hello, World!')"],
      java: ['System.out.println("Hello, World!");'],
      c: ['printf("Hello, World!\\n");', 'printf("Hello, World!");'],
      lua: ['print("Hello, World!")', "print('Hello, World!')"],
    },
    starterByLanguage: {
      javascript: '// Affiche Hello, World!\n',
      python: '# Affiche Hello, World!\n',
      java: '// Affiche Hello, World!\n',
      c: '// Affiche Hello, World!\n',
      lua: '-- Affiche Hello, World!\n',
    },
  },
  {
    id: 2,
    title: "Ton premier texte personnalisé",
    concept: "Chaînes de caractères",
    pedagogy: "Les chaînes représentent du texte.",
    task: 'Affiche exactement : "Bienvenue sur Viervier Lyngo"',
    hint: "Utilise des guillemets autour du texte.",
    explanation:
      "Les chaînes de caractères doivent être entourées de délimiteurs. Cette notion revient partout.",
    expectedOutput: "Bienvenue sur Viervier Lyngo",
    acceptedByLanguage: {
      javascript: ['console.log("Bienvenue sur Viervier Lyngo")', "console.log('Bienvenue sur Viervier Lyngo')"],
      python: ['print("Bienvenue sur Viervier Lyngo")', "print('Bienvenue sur Viervier Lyngo')"],
      java: ['System.out.println("Bienvenue sur Viervier Lyngo");'],
      c: ['printf("Bienvenue sur Viervier Lyngo\\n");', 'printf("Bienvenue sur Viervier Lyngo");'],
      lua: ['print("Bienvenue sur Viervier Lyngo")', "print('Bienvenue sur Viervier Lyngo')"],
    },
  },
  {
    id: 3,
    title: "Déclarer une variable",
    concept: "Variables",
    pedagogy: "Une variable permet de stocker une valeur réutilisable.",
    task: "Crée une variable nommée age avec la valeur 18, puis affiche-la.",
    hint: "Déclare la variable, puis affiche son contenu.",
    explanation: "Les variables servent à mémoriser des données et à les manipuler.",
    expectedOutput: "18",
    acceptedByLanguage: {
      javascript: ["let age = 18;\nconsole.log(age)", "const age = 18;\nconsole.log(age)", "var age = 18;\nconsole.log(age)"],
      python: ["age = 18\nprint(age)"],
      java: ["int age = 18;\nSystem.out.println(age);"],
      c: ['int age = 18;\nprintf("%d\\n", age);', 'int age = 18;\nprintf("%d", age);'],
      lua: ["local age = 18\nprint(age)", "age = 18\nprint(age)"],
    },
  },
  {
    id: 4,
    title: "Addition simple",
    concept: "Opérateurs arithmétiques",
    pedagogy: "Les opérateurs réalisent des calculs.",
    task: "Additionne 7 et 5 dans une variable resultat puis affiche le résultat.",
    hint: "Utilise l'opérateur + puis affiche resultat.",
    explanation: "Tu apprends à combiner des valeurs pour produire un nouveau résultat.",
    expectedOutput: "12",
    requiredOperands: [7, 5],
    requiredOperator: "+",
    acceptedByLanguage: {
      javascript: ["let resultat = 7 + 5;\nconsole.log(resultat)", "const resultat = 7 + 5;\nconsole.log(resultat)"],
      python: ["resultat = 7 + 5\nprint(resultat)"],
      java: ["int resultat = 7 + 5;\nSystem.out.println(resultat);"],
      c: ['int resultat = 7 + 5;\nprintf("%d\\n", resultat);', 'int resultat = 7 + 5;\nprintf("%d", resultat);'],
      lua: ["local resultat = 7 + 5\nprint(resultat)", "resultat = 7 + 5\nprint(resultat)"],
    },
  },
  {
    id: 5,
    title: "Condition if",
    concept: "Conditions",
    pedagogy: "Une condition permet au programme de choisir un chemin.",
    task: 'Crée une variable score = 80. Si score est supérieur ou égal à 50, affiche "Réussi".',
    hint: "Utilise if avec une comparaison >=.",
    explanation: "Les structures conditionnelles introduisent la prise de décision.",
    expectedOutput: "Réussi",
    acceptedByLanguage: {
      javascript: ["let score = 80;\nif (score >= 50) {\n  console.log('Réussi')\n}", "const score = 80;\nif (score >= 50) {\n  console.log(\"Réussi\")\n}"],
      python: ["score = 80\nif score >= 50:\n    print('Réussi')", 'score = 80\nif score >= 50:\n    print("Réussi")'],
      java: ['int score = 80;\nif (score >= 50) {\n  System.out.println("Réussi");\n}'],
      c: ['int score = 80;\nif (score >= 50) {\n  printf("Réussi\\n");\n}', 'int score = 80;\nif (score >= 50) {\n  printf("Réussi");\n}'],
      lua: ["local score = 80\nif score >= 50 then\n  print('Réussi')\nend", 'score = 80\nif score >= 50 then\n  print("Réussi")\nend'],
    },
  },
  {
    id: 6,
    title: "Condition if / else",
    concept: "Branches alternatives",
    pedagogy: "Le monde aime les bifurcations. Le code aussi.",
    task: 'Crée une variable temperature = 15. Si elle est supérieure à 20 affiche "Chaud", sinon affiche "Frais".',
    hint: "Utilise if / else.",
    explanation: "Cette structure rend ton programme robuste en couvrant plusieurs situations.",
    expectedOutput: "Frais",
    acceptedByLanguage: {
      javascript: ["let temperature = 15;\nif (temperature > 20) {\n  console.log('Chaud')\n} else {\n  console.log('Frais')\n}", 'const temperature = 15;\nif (temperature > 20) {\n  console.log("Chaud")\n} else {\n  console.log("Frais")\n}'],
      python: ["temperature = 15\nif temperature > 20:\n    print('Chaud')\nelse:\n    print('Frais')", 'temperature = 15\nif temperature > 20:\n    print("Chaud")\nelse:\n    print("Frais")'],
      java: ['int temperature = 15;\nif (temperature > 20) {\n  System.out.println("Chaud");\n} else {\n  System.out.println("Frais");\n}'],
      c: ['int temperature = 15;\nif (temperature > 20) {\n  printf("Chaud\\n");\n} else {\n  printf("Frais\\n");\n}', 'int temperature = 15;\nif (temperature > 20) {\n  printf("Chaud");\n} else {\n  printf("Frais");\n}'],
      lua: ["local temperature = 15\nif temperature > 20 then\n  print('Chaud')\nelse\n  print('Frais')\nend", 'temperature = 15\nif temperature > 20 then\n  print("Chaud")\nelse\n  print("Frais")\nend'],
    },
  },
  {
    id: 7,
    title: "Boucle for",
    concept: "Répétition",
    pedagogy: "Les boucles évitent de recopier le même code encore et encore.",
    task: "Affiche les nombres de 1 à 3, chacun sur une ligne.",
    hint: "Utilise une boucle for.",
    explanation: "Une boucle automatise une répétition contrôlée.",
    expectedOutput: "1\n2\n3",
    acceptedByLanguage: {
      javascript: ["for (let i = 1; i <= 3; i++) {\n  console.log(i)\n}"],
      python: ["for i in range(1, 4):\n    print(i)"],
      java: ["for (int i = 1; i <= 3; i++) {\n  System.out.println(i);\n}"],
      c: ['for (int i = 1; i <= 3; i++) {\n  printf("%d\\n", i);\n}'],
      lua: ["for i = 1, 3 do\n  print(i)\nend"],
    },
  },
  {
    id: 8,
    title: "Boucle while",
    concept: "Répétition conditionnelle",
    pedagogy: "La boucle while continue tant qu'une condition reste vraie.",
    task: "Affiche les nombres 3, 2, 1 avec une boucle while.",
    hint: "Commence avec une variable à 3 et décrémente-la.",
    explanation: "While est parfaite quand on surveille un état.",
    expectedOutput: "3\n2\n1",
    acceptedByLanguage: {
      javascript: ["let i = 3;\nwhile (i >= 1) {\n  console.log(i)\n  i--\n}"],
      python: ["i = 3\nwhile i >= 1:\n    print(i)\n    i -= 1"],
      java: ["int i = 3;\nwhile (i >= 1) {\n  System.out.println(i);\n  i--;\n}"],
      c: ['int i = 3;\nwhile (i >= 1) {\n  printf("%d\\n", i);\n  i--;\n}'],
      lua: ["local i = 3\nwhile i >= 1 do\n  print(i)\n  i = i - 1\nend"],
    },
  },
  {
    id: 9,
    title: "Fonction simple",
    concept: "Fonctions",
    pedagogy: "Une fonction regroupe du code réutilisable sous un nom.",
    task: 'Crée une fonction saluer qui affiche "Bonjour" puis appelle-la.',
    hint: "Déclare la fonction puis exécute-la.",
    explanation: "Les fonctions améliorent l'organisation et la réutilisation.",
    expectedOutput: "Bonjour",
    acceptedByLanguage: {
      javascript: ["function saluer() {\n  console.log('Bonjour')\n}\nsaluer()", 'function saluer() {\n  console.log("Bonjour")\n}\nsaluer()'],
      python: ["def saluer():\n    print('Bonjour')\n\nsaluer()", 'def saluer():\n    print("Bonjour")\n\nsaluer()'],
      java: ['public class Main {\n  static void saluer() {\n    System.out.println("Bonjour");\n  }\n\n  public static void main(String[] args) {\n    saluer();\n  }\n}'],
      c: ['void saluer() {\n  printf("Bonjour\\n");\n}\n\nint main() {\n  saluer();\n  return 0;\n}', 'void saluer() {\n  printf("Bonjour");\n}\n\nint main() {\n  saluer();\n  return 0;\n}'],
      lua: ["function saluer()\n  print('Bonjour')\nend\n\nsaluer()", 'function saluer()\n  print("Bonjour")\nend\n\nsaluer()'],
    },
  },
  {
    id: 10,
    title: "Fonction avec paramètre",
    concept: "Paramètres",
    pedagogy: "Un paramètre rend une fonction flexible.",
    task: "Crée une fonction doubler(nombre) qui affiche le double de 6 quand tu l'appelles.",
    hint: "La fonction reçoit un nombre et affiche nombre * 2.",
    explanation: "Les paramètres permettent de transmettre des données à une fonction.",
    expectedOutput: "12",
    acceptedByLanguage: {
      javascript: ["function doubler(nombre) {\n  console.log(nombre * 2)\n}\ndoubler(6)"],
      python: ["def doubler(nombre):\n    print(nombre * 2)\n\ndoubler(6)"],
      java: ['public class Main {\n  static void doubler(int nombre) {\n    System.out.println(nombre * 2);\n  }\n\n  public static void main(String[] args) {\n    doubler(6);\n  }\n}'],
      c: ['void doubler(int nombre) {\n  printf("%d\\n", nombre * 2);\n}\n\nint main() {\n  doubler(6);\n  return 0;\n}'],
      lua: ["function doubler(nombre)\n  print(nombre * 2)\nend\n\ndoubler(6)"],
    },
  },
  {
    id: 11,
    title: "Tableau / Liste",
    concept: "Structures de données linéaires",
    pedagogy: "Les listes et tableaux stockent plusieurs valeurs.",
    task: "Crée une liste ou un tableau contenant 10, 20, 30 puis affiche le premier élément.",
    hint: "L'index du premier élément est souvent 0.",
    explanation: "Tu découvres l'accès par index.",
    expectedOutput: "10",
    acceptedByLanguage: {
      javascript: ["const nombres = [10, 20, 30];\nconsole.log(nombres[0])", "let nombres = [10, 20, 30];\nconsole.log(nombres[0])"],
      python: ["nombres = [10, 20, 30]\nprint(nombres[0])"],
      java: ["int[] nombres = {10, 20, 30};\nSystem.out.println(nombres[0]);"],
      c: ['int nombres[] = {10, 20, 30};\nprintf("%d\\n", nombres[0]);', 'int nombres[] = {10, 20, 30};\nprintf("%d", nombres[0]);'],
      lua: ["local nombres = {10, 20, 30}\nprint(nombres[1])", "nombres = {10, 20, 30}\nprint(nombres[1])"],
    },
  },
  {
    id: 12,
    title: "Parcourir une collection",
    concept: "Itération sur structure",
    pedagogy: "Une collection devient utile quand on sait la parcourir.",
    task: "Parcours la liste [1, 2, 3] et affiche chaque élément sur une nouvelle ligne.",
    hint: "Utilise une boucle adaptée aux collections.",
    explanation: "Cette compétence relie boucles et structures de données.",
    expectedOutput: "1\n2\n3",
    acceptedByLanguage: {
      javascript: ["const nombres = [1, 2, 3];\nfor (const nombre of nombres) {\n  console.log(nombre)\n}", "let nombres = [1, 2, 3];\nfor (const nombre of nombres) {\n  console.log(nombre)\n}"],
      python: ["nombres = [1, 2, 3]\nfor nombre in nombres:\n    print(nombre)"],
      java: ["int[] nombres = {1, 2, 3};\nfor (int nombre : nombres) {\n  System.out.println(nombre);\n}"],
      c: ['int nombres[] = {1, 2, 3};\nfor (int i = 0; i < 3; i++) {\n  printf("%d\\n", nombres[i]);\n}'],
      lua: ["local nombres = {1, 2, 3}\nfor _, nombre in ipairs(nombres) do\n  print(nombre)\nend"],
    },
  },
  {
    id: 13,
    title: "Objet / Dictionnaire",
    concept: "Structures clé-valeur",
    pedagogy: "Les objets et dictionnaires associent une clé à une valeur.",
    task: 'Crée une structure utilisateur avec le prénom "Lina" puis affiche ce prénom.',
    hint: "Déclare une clé prenom et affiche sa valeur.",
    explanation: "Les structures clé-valeur modélisent bien des entités réelles.",
    expectedOutput: "Lina",
    requiredKeyAccess: "prenom",
    acceptedByLanguage: {
      javascript: ["const utilisateur = { prenom: 'Lina' };\nconsole.log(utilisateur.prenom)", 'const utilisateur = { prenom: "Lina" };\nconsole.log(utilisateur.prenom)'],
      python: ["utilisateur = {'prenom': 'Lina'}\nprint(utilisateur['prenom'])", 'utilisateur = {"prenom": "Lina"}\nprint(utilisateur["prenom"])'],
      java: ['import java.util.HashMap;\n\nHashMap<String, String> utilisateur = new HashMap<>();\nutilisateur.put("prenom", "Lina");\nSystem.out.println(utilisateur.get("prenom"));'],
      c: ['printf("Lina\\n");', 'printf("Lina");'],
      lua: ["local utilisateur = { prenom = 'Lina' }\nprint(utilisateur.prenom)", 'utilisateur = { prenom = "Lina" }\nprint(utilisateur.prenom)'],
    },
  },
  {
    id: 14,
    title: "Retour de fonction",
    concept: "Valeur de retour",
    pedagogy: "Une fonction peut renvoyer une valeur.",
    task: "Crée une fonction addition(a, b) qui retourne leur somme, puis affiche le résultat de addition(4, 6).",
    hint: "Utilise return dans la fonction, puis affiche l'appel.",
    explanation: "La valeur de retour permet de produire un résultat réutilisable.",
    expectedOutput: "10",
    requiredFunctionName: "addition",
    requiredFunctionArgs: [4, 6],
    acceptedByLanguage: {
      javascript: ["function addition(a, b) {\n  return a + b\n}\nconsole.log(addition(4, 6))"],
      python: ["def addition(a, b):\n    return a + b\n\nprint(addition(4, 6))"],
      java: ['public class Main {\n  static int addition(int a, int b) {\n    return a + b;\n  }\n\n  public static void main(String[] args) {\n    System.out.println(addition(4, 6));\n  }\n}'],
      c: ['int addition(int a, int b) {\n  return a + b;\n}\n\nint main() {\n  printf("%d\\n", addition(4, 6));\n  return 0;\n}'],
      lua: ["function addition(a, b)\n  return a + b\nend\n\nprint(addition(4, 6))"],
    },
  },
  {
    id: 15,
    title: "Mini défi final",
    concept: "Synthèse",
    pedagogy: "Dernière marche : mélanger variables, boucles, conditions et fonctions.",
    task: 'Crée une fonction estPair(nombre) qui affiche "Pair" si 8 est pair, sinon "Impair", puis appelle-la avec 8.',
    hint: "Teste le reste d'une division par 2.",
    explanation: "Ce niveau consolide plusieurs notions à la fois.",
    expectedOutput: "Pair",
    acceptedByLanguage: {
      javascript: ["function estPair(nombre) {\n  if (nombre % 2 === 0) {\n    console.log('Pair')\n  } else {\n    console.log('Impair')\n  }\n}\nestPair(8)", 'function estPair(nombre) {\n  if (nombre % 2 === 0) {\n    console.log("Pair")\n  } else {\n    console.log("Impair")\n  }\n}\nestPair(8)'],
      python: ["def estPair(nombre):\n    if nombre % 2 == 0:\n        print('Pair')\n    else:\n        print('Impair')\n\nestPair(8)", 'def estPair(nombre):\n    if nombre % 2 == 0:\n        print("Pair")\n    else:\n        print("Impair")\n\nestPair(8)'],
      java: ['public class Main {\n  static void estPair(int nombre) {\n    if (nombre % 2 == 0) {\n      System.out.println("Pair");\n    } else {\n      System.out.println("Impair");\n    }\n  }\n\n  public static void main(String[] args) {\n    estPair(8);\n  }\n}'],
      c: ['void estPair(int nombre) {\n  if (nombre % 2 == 0) {\n    printf("Pair\\n");\n  } else {\n    printf("Impair\\n");\n  }\n}\n\nint main() {\n  estPair(8);\n  return 0;\n}'],
      lua: ["function estPair(nombre)\n  if nombre % 2 == 0 then\n    print('Pair')\n  else\n    print('Impair')\n  end\nend\n\nestPair(8)"],
    },
  },
  {
    id: 16,
    title: "Concaténer des chaînes",
    concept: "Concaténation",
    pedagogy: "Assembler deux chaînes pour former un texte plus long est une opération fondamentale.",
    task: 'Crée une variable prenom = "Alice" et affiche "Bonjour Alice" en concaténant une chaîne et la variable.',
    hint: "Utilise l'opérateur + (ou .. en Lua) pour coller des chaînes ensemble.",
    explanation: "La concaténation permet de construire dynamiquement des messages à partir de variables.",
    expectedOutput: "Bonjour Alice",
    acceptedByLanguage: {
      javascript: ['const prenom = "Alice";\nconsole.log("Bonjour " + prenom)', "const prenom = 'Alice';\nconsole.log('Bonjour ' + prenom)", 'console.log("Bonjour " + "Alice")', 'console.log("Bonjour Alice")'],
      python: ['prenom = "Alice"\nprint("Bonjour " + prenom)', "prenom = 'Alice'\nprint('Bonjour ' + prenom)", 'print("Bonjour " + "Alice")', 'print("Bonjour Alice")'],
      java: ['String prenom = "Alice";\nSystem.out.println("Bonjour " + prenom);', 'System.out.println("Bonjour Alice");'],
      c: ['printf("Bonjour Alice\\n");', 'printf("Bonjour Alice");'],
      lua: ['local prenom = "Alice"\nprint("Bonjour " .. prenom)', 'print("Bonjour " .. "Alice")', 'print("Bonjour Alice")'],
    },
  },
  {
    id: 17,
    title: "Longueur d'une chaîne",
    concept: "Manipulation de chaînes",
    pedagogy: "Connaître la taille d'une chaîne est indispensable pour valider des formulaires ou traiter du texte.",
    task: 'Affiche le nombre de caractères du mot "Hello" (soit 5).',
    hint: "Utilise .length en JS, len() en Python, strlen() en C, # en Lua.",
    explanation: "Chaque langage fournit un moyen de mesurer la longueur d'une chaîne.",
    expectedOutput: "5",
    acceptedByLanguage: {
      javascript: ['const mot = "Hello";\nconsole.log(mot.length)', 'console.log("Hello".length)'],
      python: ['mot = "Hello"\nprint(len(mot))', 'print(len("Hello"))'],
      java: ['System.out.println("Hello".length());'],
      c: ['#include <string.h>\nprintf("%lu\\n", strlen("Hello"));', 'printf("5\\n");', 'printf("5");'],
      lua: ['print(#"Hello")', 'local mot = "Hello"\nprint(#mot)'],
    },
  },
  {
    id: 18,
    title: "Conversion entier → chaîne",
    concept: "Conversion de types",
    pedagogy: "Mélanger des types dans un message nécessite souvent de convertir un nombre en texte.",
    task: 'Crée une variable age = 25 et affiche "Age: 25" en convertissant le nombre en chaîne.',
    hint: "Utilise String() ou la concaténation directe en JS, str() en Python, ou %d en C.",
    explanation: "La conversion de types est nécessaire pour assembler des données hétérogènes.",
    expectedOutput: "Age: 25",
    acceptedByLanguage: {
      javascript: ['const age = 25;\nconsole.log("Age: " + age)', 'const age = 25;\nconsole.log("Age: " + String(age))', 'console.log("Age: 25")'],
      python: ['age = 25\nprint("Age: " + str(age))', 'age = 25\nprint(f"Age: {age}")', 'print("Age: 25")'],
      java: ['int age = 25;\nSystem.out.println("Age: " + age);', 'System.out.println("Age: 25");'],
      c: ['int age = 25;\nprintf("Age: %d\\n", age);', 'printf("Age: 25\\n");', 'printf("Age: 25");'],
      lua: ['local age = 25\nprint("Age: " .. age)', 'print("Age: 25")'],
    },
  },
  {
    id: 19,
    title: "Valeur absolue",
    concept: "Fonctions mathématiques",
    pedagogy: "Les bibliothèques mathématiques offrent des fonctions prêtes à l'emploi pour les calculs courants.",
    task: "Affiche la valeur absolue de -8 (soit 8).",
    hint: "Utilise Math.abs() en JS/Java, abs() en Python/C, math.abs() en Lua.",
    explanation: "Les fonctions mathématiques standard évitent de réécrire des calculs basiques.",
    expectedOutput: "8",
    acceptedByLanguage: {
      javascript: ['console.log(Math.abs(-8))', 'const n = -8;\nconsole.log(Math.abs(n))'],
      python: ['print(abs(-8))', 'n = -8\nprint(abs(n))'],
      java: ['System.out.println(Math.abs(-8));'],
      c: ['#include <stdlib.h>\nprintf("%d\\n", abs(-8));', 'printf("8\\n");', 'printf("8");'],
      lua: ['print(math.abs(-8))'],
    },
  },
  {
    id: 20,
    title: "Opérateur modulo",
    concept: "Arithmétique modulaire",
    pedagogy: "Le modulo renvoie le reste d'une division entière — très utilisé pour tester la parité ou créer des cycles.",
    task: "Affiche le reste de 10 divisé par 3 (soit 1).",
    hint: "Utilise l'opérateur %.",
    explanation: "10 % 3 = 1 car 10 = 3 × 3 + 1. Le modulo est au cœur de nombreux algorithmes.",
    expectedOutput: "1",
    acceptedByLanguage: {
      javascript: ['console.log(10 % 3)', 'const r = 10 % 3;\nconsole.log(r)'],
      python: ['print(10 % 3)', 'r = 10 % 3\nprint(r)'],
      java: ['System.out.println(10 % 3);'],
      c: ['printf("%d\\n", 10 % 3);', 'printf("1\\n");', 'printf("1");'],
      lua: ['print(10 % 3)'],
    },
  },
  {
    id: 21,
    title: "Condition imbriquée",
    concept: "if / else if / else",
    pedagogy: "Enchaîner des conditions permet de couvrir plusieurs cas mutuellement exclusifs.",
    task: 'Crée une variable age = 20. Affiche "Enfant" si age < 13, "Adolescent" si age < 18, sinon "Majeur".',
    hint: "Utilise else if (ou elif en Python, elseif en Lua) entre if et else.",
    explanation: "Les conditions en chaîne évitent d'imbriquer des if dans des else — le code reste lisible.",
    expectedOutput: "Majeur",
    acceptedByLanguage: {
      javascript: ['const age = 20;\nif (age < 13) {\n  console.log("Enfant")\n} else if (age < 18) {\n  console.log("Adolescent")\n} else {\n  console.log("Majeur")\n}'],
      python: ['age = 20\nif age < 13:\n    print("Enfant")\nelif age < 18:\n    print("Adolescent")\nelse:\n    print("Majeur")'],
      java: ['int age = 20;\nif (age < 13) {\n  System.out.println("Enfant");\n} else if (age < 18) {\n  System.out.println("Adolescent");\n} else {\n  System.out.println("Majeur");\n}'],
      c: ['int age = 20;\nif (age < 13) {\n  printf("Enfant\\n");\n} else if (age < 18) {\n  printf("Adolescent\\n");\n} else {\n  printf("Majeur\\n");\n}', 'printf("Majeur\\n");', 'printf("Majeur");'],
      lua: ['local age = 20\nif age < 13 then\n  print("Enfant")\nelseif age < 18 then\n  print("Adolescent")\nelse\n  print("Majeur")\nend'],
    },
  },
  {
    id: 22,
    title: "Boucle avec pas",
    concept: "Boucle avec step",
    pedagogy: "Contrôler le pas d'une boucle permet de sauter des valeurs et de créer des séquences non consécutives.",
    task: "Affiche les nombres pairs 2, 4, 6, chacun sur une ligne, en utilisant une boucle avec un pas de 2.",
    hint: "En JS : i += 2 ; en Python : range(2, 7, 2) ; en Lua : for i = 2, 6, 2.",
    explanation: "Le paramètre de pas contrôle l'incrément à chaque tour de boucle.",
    expectedOutput: "2\n4\n6",
    acceptedByLanguage: {
      javascript: ['for (let i = 2; i <= 6; i += 2) {\n  console.log(i)\n}'],
      python: ['for i in range(2, 7, 2):\n    print(i)'],
      java: ['for (int i = 2; i <= 6; i += 2) {\n  System.out.println(i);\n}'],
      c: ['for (int i = 2; i <= 6; i += 2) {\n  printf("%d\\n", i);\n}'],
      lua: ['for i = 2, 6, 2 do\n  print(i)\nend'],
    },
  },
  {
    id: 23,
    title: "Fonction retournant une chaîne",
    concept: "Fonctions avec retour",
    pedagogy: "Une fonction peut construire et retourner une valeur plutôt que de l'afficher directement.",
    task: 'Crée une fonction saluer(prenom) qui retourne la chaîne "Bonjour " + prenom, puis affiche saluer("Alice").',
    hint: "Utilise return dans la fonction, puis passe son résultat à la fonction d'affichage.",
    explanation: "Retourner une valeur rend la fonction plus modulaire et testable.",
    expectedOutput: "Bonjour Alice",
    acceptedByLanguage: {
      javascript: ['function saluer(prenom) {\n  return "Bonjour " + prenom\n}\nconsole.log(saluer("Alice"))', "function saluer(prenom) {\n  return 'Bonjour ' + prenom\n}\nconsole.log(saluer('Alice'))"],
      python: ['def saluer(prenom):\n    return "Bonjour " + prenom\n\nprint(saluer("Alice"))', "def saluer(prenom):\n    return 'Bonjour ' + prenom\n\nprint(saluer('Alice'))"],
      java: ['public class Main {\n  static String saluer(String prenom) {\n    return "Bonjour " + prenom;\n  }\n\n  public static void main(String[] args) {\n    System.out.println(saluer("Alice"));\n  }\n}'],
      c: ['printf("Bonjour Alice\\n");', 'printf("Bonjour Alice");'],
      lua: ['function saluer(prenom)\n  return "Bonjour " .. prenom\nend\n\nprint(saluer("Alice"))', "function saluer(prenom)\n  return 'Bonjour ' .. prenom\nend\n\nprint(saluer('Alice'))"],
    },
  },
  {
    id: 24,
    title: "Récursion — Factorielle",
    concept: "Récursion",
    pedagogy: "Une fonction récursive s'appelle elle-même — idéale pour les problèmes à structure répétitive.",
    task: "Crée une fonction factorielle(n) récursive et affiche factorielle(5) (soit 120).",
    hint: "Cas de base : si n <= 1, retourne 1. Sinon retourne n * factorielle(n - 1).",
    explanation: "La récursion décompose un problème en sous-problèmes identiques jusqu'au cas de base.",
    expectedOutput: "120",
    acceptedByLanguage: {
      javascript: ['function factorielle(n) {\n  if (n <= 1) return 1\n  return n * factorielle(n - 1)\n}\nconsole.log(factorielle(5))'],
      python: ['def factorielle(n):\n    if n <= 1:\n        return 1\n    return n * factorielle(n - 1)\n\nprint(factorielle(5))'],
      java: ['public class Main {\n  static int factorielle(int n) {\n    if (n <= 1) return 1;\n    return n * factorielle(n - 1);\n  }\n\n  public static void main(String[] args) {\n    System.out.println(factorielle(5));\n  }\n}'],
      c: ['int factorielle(int n) {\n  if (n <= 1) return 1;\n  return n * factorielle(n - 1);\n}\n\nint main() {\n  printf("%d\\n", factorielle(5));\n  return 0;\n}'],
      lua: ['function factorielle(n)\n  if n <= 1 then return 1 end\n  return n * factorielle(n - 1)\nend\n\nprint(factorielle(5))'],
    },
  },
  {
    id: 25,
    title: "Ajouter à un tableau",
    concept: "Tableaux dynamiques",
    pedagogy: "Les tableaux dynamiques grandissent au fil de l'exécution — une capacité essentielle.",
    task: "Crée un tableau [1, 2, 3], ajoute un élément, puis affiche sa longueur (soit 4).",
    hint: "Utilise .push() en JS, .append() en Python, table.insert() en Lua.",
    explanation: "Les méthodes d'ajout permettent de construire des collections à la volée.",
    expectedOutput: "4",
    acceptedByLanguage: {
      javascript: ['const nombres = [1, 2, 3];\nnombres.push(4);\nconsole.log(nombres.length)', 'let nombres = [1, 2, 3];\nnombres.push(4);\nconsole.log(nombres.length)'],
      python: ['nombres = [1, 2, 3]\nnombres.append(4)\nprint(len(nombres))'],
      java: ['import java.util.ArrayList;\n\nArrayList<Integer> nombres = new ArrayList<>();\nnombres.add(1);\nnombres.add(2);\nnombres.add(3);\nnombres.add(4);\nSystem.out.println(nombres.size());', 'System.out.println(4);'],
      c: ['printf("4\\n");', 'printf("4");'],
      lua: ['local nombres = {1, 2, 3}\ntable.insert(nombres, 4)\nprint(#nombres)', 'nombres = {1, 2, 3}\ntable.insert(nombres, 4)\nprint(#nombres)'],
    },
  },
  {
    id: 26,
    title: "Filtrer un tableau",
    concept: "Filtrage de collection",
    pedagogy: "Extraire un sous-ensemble selon un critère est une opération très fréquente en programmation.",
    task: "Filtre le tableau [1, 2, 3, 4, 5] pour ne garder que les nombres pairs, puis affiche-les chacun sur une ligne.",
    hint: "Utilise .filter() en JS, une compréhension de liste ou une boucle en Python.",
    explanation: "Le filtrage transforme une collection en gardant uniquement les éléments qui satisfont une condition.",
    expectedOutput: "2\n4",
    acceptedByLanguage: {
      javascript: ['const nombres = [1, 2, 3, 4, 5];\nconst pairs = nombres.filter(n => n % 2 === 0);\nfor (const n of pairs) {\n  console.log(n)\n}', 'const pairs = [1,2,3,4,5].filter(n => n % 2 === 0);\npairs.forEach(n => console.log(n))'],
      python: ['nombres = [1, 2, 3, 4, 5]\npairs = [n for n in nombres if n % 2 == 0]\nfor n in pairs:\n    print(n)', 'for n in [1,2,3,4,5]:\n    if n % 2 == 0:\n        print(n)'],
      java: ['for (int n : new int[]{1,2,3,4,5}) {\n  if (n % 2 == 0) System.out.println(n);\n}', 'System.out.println(2);\nSystem.out.println(4);'],
      c: ['int nombres[] = {1,2,3,4,5};\nfor (int i = 0; i < 5; i++) {\n  if (nombres[i] % 2 == 0) printf("%d\\n", nombres[i]);\n}', 'printf("2\\n");\nprintf("4\\n");'],
      lua: ['local nombres = {1,2,3,4,5}\nfor _, n in ipairs(nombres) do\n  if n % 2 == 0 then\n    print(n)\n  end\nend'],
    },
  },
  {
    id: 27,
    title: "Maximum d'une liste",
    concept: "Fonctions d'agrégation",
    pedagogy: "Trouver la valeur maximale d'une collection est un classique souvent résolu avec une seule fonction.",
    task: "Affiche le maximum de la liste [3, 7, 2, 9, 1] (soit 9).",
    hint: "Utilise Math.max(...tab) en JS, max() en Python.",
    explanation: "Les fonctions d'agrégation résument une collection en une valeur unique.",
    expectedOutput: "9",
    acceptedByLanguage: {
      javascript: ['const nombres = [3, 7, 2, 9, 1];\nconsole.log(Math.max(...nombres))', 'console.log(Math.max(3, 7, 2, 9, 1))'],
      python: ['nombres = [3, 7, 2, 9, 1]\nprint(max(nombres))', 'print(max([3, 7, 2, 9, 1]))'],
      java: ['int[] nombres = {3, 7, 2, 9, 1};\nint max = nombres[0];\nfor (int n : nombres) { if (n > max) max = n; }\nSystem.out.println(max);', 'System.out.println(9);'],
      c: ['printf("9\\n");', 'printf("9");'],
      lua: ['local nombres = {3,7,2,9,1}\nlocal max = nombres[1]\nfor _, n in ipairs(nombres) do\n  if n > max then max = n end\nend\nprint(max)'],
    },
  },
  {
    id: 28,
    title: "Inverser une chaîne",
    concept: "Manipulation avancée de chaînes",
    pedagogy: "Inverser une chaîne illustre comment les langages abordent la transformation de séquences.",
    task: 'Inverse la chaîne "hello" et affiche "olleh".',
    hint: 'En Python : "hello"[::-1]. En JS : split("").reverse().join(""). En Lua : string.reverse().',
    explanation: "L'inversion de chaîne teste la connaissance des méthodes de manipulation de séquences.",
    expectedOutput: "olleh",
    acceptedByLanguage: {
      javascript: ['const mot = "hello";\nconsole.log(mot.split("").reverse().join(""))', 'console.log("hello".split("").reverse().join(""))'],
      python: ['mot = "hello"\nprint(mot[::-1])', 'print("hello"[::-1])'],
      java: ['System.out.println(new StringBuilder("hello").reverse().toString());'],
      c: ['printf("olleh\\n");', 'printf("olleh");'],
      lua: ['print(string.reverse("hello"))', 'print(("hello"):reverse())'],
    },
  },
  {
    id: 29,
    title: "Compter les occurrences",
    concept: "Recherche dans une chaîne",
    pedagogy: "Compter combien de fois un caractère apparaît dans un texte est une tâche fréquente en traitement de données.",
    task: 'Affiche le nombre d\'occurrences de "l" dans "hello world" (soit 3).',
    hint: 'Utilise .count() en Python, split() en JS, ou une boucle.',
    explanation: "Parcourir une chaîne à la recherche d'un motif prépare aux algorithmes de traitement de texte.",
    expectedOutput: "3",
    acceptedByLanguage: {
      javascript: ['const texte = "hello world";\nconsole.log(texte.split("l").length - 1)', 'const texte = "hello world";\nlet count = 0;\nfor (const c of texte) if (c === "l") count++;\nconsole.log(count)'],
      python: ['texte = "hello world"\nprint(texte.count("l"))', 'print("hello world".count("l"))'],
      java: ['String texte = "hello world";\nSystem.out.println(texte.length() - texte.replace("l","").length());', 'System.out.println(3);'],
      c: ['printf("3\\n");', 'printf("3");'],
      lua: ['local texte = "hello world"\nlocal count = 0\nfor _ in texte:gmatch("l") do count = count + 1 end\nprint(count)'],
    },
  },
  {
    id: 30,
    title: "Défi final — FizzBuzz",
    concept: "Synthèse avancée",
    pedagogy: "FizzBuzz est le classique des entretiens techniques — il combine conditions, modulo et affichage.",
    task: "Crée une fonction fizzBuzz(n) : si n est divisible par 3 et 5 affiche \"FizzBuzz\", par 3 seulement \"Fizz\", par 5 seulement \"Buzz\", sinon le nombre. Appelle-la avec 15.",
    hint: "Teste d'abord la divisibilité par 15 (ou par 3 ET 5), puis par 3, puis par 5.",
    explanation: "FizzBuzz synthétise les conditions, le modulo et les fonctions — bravo, tu maîtrises les bases !",
    expectedOutput: "FizzBuzz",
    acceptedByLanguage: {
      javascript: ['function fizzBuzz(n) {\n  if (n % 15 === 0) console.log("FizzBuzz")\n  else if (n % 3 === 0) console.log("Fizz")\n  else if (n % 5 === 0) console.log("Buzz")\n  else console.log(n)\n}\nfizzBuzz(15)', 'function fizzBuzz(n) {\n  if (n % 3 === 0 && n % 5 === 0) console.log("FizzBuzz")\n  else if (n % 3 === 0) console.log("Fizz")\n  else if (n % 5 === 0) console.log("Buzz")\n  else console.log(n)\n}\nfizzBuzz(15)'],
      python: ['def fizzBuzz(n):\n    if n % 15 == 0:\n        print("FizzBuzz")\n    elif n % 3 == 0:\n        print("Fizz")\n    elif n % 5 == 0:\n        print("Buzz")\n    else:\n        print(n)\n\nfizzBuzz(15)', 'def fizzBuzz(n):\n    if n % 3 == 0 and n % 5 == 0:\n        print("FizzBuzz")\n    elif n % 3 == 0:\n        print("Fizz")\n    elif n % 5 == 0:\n        print("Buzz")\n    else:\n        print(n)\n\nfizzBuzz(15)'],
      java: ['public class Main {\n  static void fizzBuzz(int n) {\n    if (n % 15 == 0) System.out.println("FizzBuzz");\n    else if (n % 3 == 0) System.out.println("Fizz");\n    else if (n % 5 == 0) System.out.println("Buzz");\n    else System.out.println(n);\n  }\n\n  public static void main(String[] args) {\n    fizzBuzz(15);\n  }\n}'],
      c: ['void fizzBuzz(int n) {\n  if (n % 15 == 0) printf("FizzBuzz\\n");\n  else if (n % 3 == 0) printf("Fizz\\n");\n  else if (n % 5 == 0) printf("Buzz\\n");\n  else printf("%d\\n", n);\n}\n\nint main() {\n  fizzBuzz(15);\n  return 0;\n}', 'printf("FizzBuzz\\n");', 'printf("FizzBuzz");'],
      lua: ['function fizzBuzz(n)\n  if n % 15 == 0 then\n    print("FizzBuzz")\n  elseif n % 3 == 0 then\n    print("Fizz")\n  elseif n % 5 == 0 then\n    print("Buzz")\n  else\n    print(n)\n  end\nend\n\nfizzBuzz(15)'],
    },
  },
];

const STORAGE_KEY = "viervier-lyngo-progress-v2";

const COMMENT_PREFIXES = ["//", "#", "--"];

function stripComments(str) {
  return str
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      return trimmed.length > 0 && !COMMENT_PREFIXES.some((p) => trimmed.startsWith(p));
    })
    .join("\n");
}

function normalizeCode(str) {
  return stripComments(str).replace(/\s+/g, " ").trim().toLowerCase();
}

// For non-JS languages: validation that checks both output intent and code structure
function flexibleMatch(userCode, level, language) {
  const accepted = level.acceptedByLanguage[language] || [];
  const userNorm = normalizeCode(userCode);
  const stripped = stripComments(userCode);
  const keyword = OUTPUT_KEYWORD[language];

  // 1. Exact normalized match with an accepted solution
  if (accepted.some((s) => normalizeCode(s) === userNorm)) return true;

  const hasKeyword = keyword && stripped.toLowerCase().includes(keyword.toLowerCase());
  if (!hasKeyword) return false;

  // 2. Mission exige une fonction précise (ex: addition(a, b))
  if (level.requiredFunctionName) {
    const funcName = level.requiredFunctionName.toLowerCase();
    const hasDefinition =
      new RegExp(`function\\s+${funcName}\\s*\\(|def\\s+${funcName}\\s*\\(`, "i").test(stripped) ||
      userNorm.includes(`function ${funcName}`) ||
      userNorm.includes(`def ${funcName}`);
    const args = level.requiredFunctionArgs || [];
    const hasCall =
      args.length === 0
        ? new RegExp(`${funcName}\\s*\\(`, "i").test(stripped)
        : new RegExp(`${funcName}\\s*\\([^)]*${args[0]}[^)]*${args[1]}`, "i").test(stripped) ||
          new RegExp(`${funcName}\\s*\\([^)]*${args[1]}[^)]*${args[0]}`, "i").test(stripped);
    if (!hasDefinition || !hasCall) return false;
  }

  // 3. Mission exige des opérandes et un opérateur précis (ex: 6 × 4, 7 + 5)
  if (level.requiredOperands && level.requiredOperator) {
    const [a, b] = level.requiredOperands;
    const opChar = level.requiredOperator.replace("*", "\\*").replace("+", "\\+").replace("-", "\\-").replace("/", "\\/");
    const exprPattern1 = new RegExp(`${a}\\s*${opChar}\\s*${b}`);
    const exprPattern2 = new RegExp(`${b}\\s*${opChar}\\s*${a}`);
    const hasRequiredExpr = exprPattern1.test(stripped) || exprPattern2.test(stripped);
    if (!hasRequiredExpr) return false;
    const expectedNum = Number(level.expectedOutput.trim());
    const exprs = stripped.match(/\d+(?:\.\d+)?(?:\s*[\+\-\*\/]\s*\d+(?:\.\d+)?)+/g) || [];
    const correctResult = exprs.some((expr) => {
      try { return eval(expr) === expectedNum; } catch { return false; }
    });
    if (correctResult) return true;
    return false;
  }

  const expectedNum = Number(level.expectedOutput.trim());
  const isNumericOutput = !isNaN(expectedNum) && String(expectedNum) === level.expectedOutput.trim();

  // 3b. Premier élément d'un tableau/liste — on accepte n'importe quel nom de variable (ex: liste, nombres, tab)
  if (level.expectedOutput === "10" && hasKeyword) {
    const hasTable10_20_30 =
      /\{10\s*,\s*20\s*,\s*30\s*\}|\{10,20,30\}/.test(stripped) ||
      /\[\s*10\s*,\s*20\s*,\s*30\s*\]|\[10,20,30\]/.test(stripped);
    if (language === "lua" && hasTable10_20_30 && /\[1\]/.test(stripped)) return true;
    if ((language === "javascript" || language === "python" || language === "java" || language === "c") && hasTable10_20_30 && /\[0\]/.test(stripped)) return true;
  }

  // 4. Sortie numérique sans contrainte d'opérande : une expression littérale doit donner le résultat
  //    (on n'accepte plus print(24) seul ni n'importe quelle paire de nombres)
  if (isNumericOutput && !level.requiredOperands) {
    const exprs = stripped.match(/\d+(?:\.\d+)?(?:\s*[\+\-\*\/]\s*\d+(?:\.\d+)?)+/g) || [];
    if (exprs.some((expr) => { try { return eval(expr) === expectedNum; } catch { return false; } })) return true;
    return false;
  }

  if (isNumericOutput && level.requiredOperands) {
    const exprs = stripped.match(/\d+(?:\.\d+)?(?:\s*[\+\-\*\/]\s*\d+(?:\.\d+)?)+/g) || [];
    if (exprs.some((expr) => { try { return eval(expr) === expectedNum; } catch { return false; } })) return true;
    return false;
  }

  // 5. Mission exige un accès par clé (ex: objet avec prenom) — rejette print("Lina") seul
  if (level.requiredKeyAccess) {
    const key = level.requiredKeyAccess;
    const hasKeyAccess =
      new RegExp(`\\.${key}\\b`).test(stripped) ||
      new RegExp(`\\["\']?${key}["\']?\\]`).test(stripped);
    if (!hasKeyAccess) return false;
  }

  // 6. Sortie chaîne : le texte attendu doit apparaître (guillemets ou concaténation)
  const escaped = level.expectedOutput.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (new RegExp(`["'\`]${escaped}["'\`]`).test(stripped)) return true;

  return false;
}

// Output keyword per language for error analysis
const OUTPUT_KEYWORD = {
  javascript: "console.log",
  python: "print",
  java: "System.out.println",
  c: "printf",
  lua: "print",
};

// Analyse a JS failure and return a human-readable hint
function analyzeJSFailure(actualOutput, expectedOutput, runtimeError) {
  if (runtimeError) return null; // the error message is already shown

  if (actualOutput === "" || actualOutput === null) {
    return "Ton code ne produit aucune sortie. As-tu bien appelé console.log() ?";
  }
  if (actualOutput.toLowerCase() === expectedOutput.toLowerCase()) {
    return "Ta sortie est presque correcte — vérifie les majuscules et minuscules.";
  }
  if (actualOutput.trim() !== actualOutput) {
    return "Ta sortie contient des espaces superflus au début ou à la fin.";
  }
  if (actualOutput.replace(/\s+/g, "") === expectedOutput.replace(/\s+/g, "")) {
    return `Le contenu est bon mais le formatage (espaces, sauts de ligne) ne correspond pas. Tu as affiché : "${actualOutput}". On attend : "${expectedOutput}".`;
  }
  if (expectedOutput.includes(actualOutput) && actualOutput.length > 0) {
    return `Ta sortie est incomplète. Tu affiches "${actualOutput}" alors qu'on attend "${expectedOutput}".`;
  }
  if (actualOutput.includes(expectedOutput)) {
    return `Tu affiches trop de choses. On attend juste "${expectedOutput}" — retire le reste.`;
  }
  return `Ton code affiche "${actualOutput}" mais on attend "${expectedOutput}". Vérifie le texte entre guillemets.`;
}

// Analyse a pattern-matching failure and return a human-readable hint
function analyzePatternFailure(userCode, level, language) {
  const stripped = stripComments(userCode).trim();
  const keyword = OUTPUT_KEYWORD[language];
  const expected = level.expectedOutput;

  if (!stripped) {
    return "Le code est vide. Commence par écrire quelque chose !";
  }
  if (keyword && !stripped.toLowerCase().includes(keyword.toLowerCase())) {
    return `Il semble que tu n'utilises pas encore \`${keyword}()\` pour afficher quelque chose.`;
  }
  // Check if expected string content is approximately present
  const hasExpected = stripped.includes(expected);
  if (!hasExpected) {
    // Check for wrong case
    if (stripped.toLowerCase().includes(expected.toLowerCase())) {
      return `Le texte est presque bon — vérifie les majuscules et minuscules. On attend : "${expected}".`;
    }
    // Check for missing punctuation
    const withoutPunct = expected.replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, "");
    if (stripped.toLowerCase().includes(withoutPunct.toLowerCase())) {
      return `Le texte est presque correct mais il manque la ponctuation. On attend exactement : "${expected}".`;
    }
    return `Le texte affiché ne correspond pas. Vérifie l'orthographe exacte : on attend "${expected}". (Pour voir la sortie réelle de ton code, utilise JavaScript ou Python.)`;
  }
  return "La structure de ton code n'est pas tout à fait correcte. Relis la mission attentivement.";
}

function getStarterCode(level, language) {
  return level.starterByLanguage?.[language] || `${LANGUAGES[language].starterComment}\n`;
}

function createInitialEditorMap(language) {
  return LEVELS.reduce((acc, level) => {
    acc[level.id] = getStarterCode(level, language);
    return acc;
  }, {});
}

function getInitialProgress(language) {
  return {
    language,
    currentLevel: 1,
    streak: 0,
    completed: [],
    submissions: {},
    editorByLevel: createInitialEditorMap(language),
    showHintByLevel: {},
    feedbackByLevel: {},
    solutionRevealedByLevel: {},
  };
}

// ── Design System ──────────────────────────────────────────────────────────────

function Card({ className = "", children, glow = false }) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.08] bg-[#0d1117]/90 backdrop-blur-sm ${
        glow ? "shadow-[0_0_40px_-10px_rgba(16,185,129,0.25)] border-emerald-500/10" : "shadow-xl shadow-black/30"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function Btn({ children, className = "", variant = "primary", size = "md", ...props }) {
  const base =
    "inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none";
  const sizes = {
    sm: "rounded-lg px-3 py-1.5 text-xs gap-1.5",
    md: "rounded-xl px-4 py-2 text-sm gap-2",
    lg: "rounded-xl px-6 py-2.5 text-sm gap-2",
  };
  const variants = {
    primary:
      "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-500/30",
    secondary:
      "bg-white/[0.06] text-slate-300 hover:bg-white/[0.1] hover:text-white border border-white/[0.08]",
    ghost: "text-slate-400 hover:text-white hover:bg-white/[0.06]",
    danger: "bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-500/20",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

function StatPill({ icon: Icon, label, value, color = "text-emerald-400" }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2">
      <Icon className={`h-4 w-4 ${color}`} />
      <span className="text-xs text-slate-500">{label}</span>
      <span className="font-mono text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
      <motion.div
        className="h-full rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />
    </div>
  );
}

// Thème Monaco aligné avec l’identité Viervier (terminal / emerald)
function defineViervierTheme(monaco) {
  monaco.editor.defineTheme("viervier-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "10b981", fontStyle: "bold" },
      { token: "string", foreground: "22d3ee" },
      { token: "comment", foreground: "64748b", fontStyle: "italic" },
      { token: "number", foreground: "fbbf24" },
      { token: "type", foreground: "a78bfa" },
      { token: "function", foreground: "34d399" },
    ],
    colors: {
      "editor.background": "#0d1117",
      "editor.foreground": "#e2e8f0",
      "editorLineNumber.foreground": "#475569",
      "editorLineNumber.activeForeground": "#10b981",
      "editorCursor.foreground": "#10b981",
      "editor.selectionBackground": "#10b98126",
      "editor.lineHighlightBackground": "#10b9810f",
      "editorLineHighlightBorder": "#10b98114",
    },
  });
}

function CodeEditor({ value, onChange, language, onSubmit }) {
  const editorRef = useRef(null);
  const onSubmitRef = useRef(onSubmit);

  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  const handleMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    defineViervierTheme(monaco);
    monaco.editor.setTheme("viervier-dark");
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onSubmitRef.current();
    });
    editor.focus();
  }, []);

  return (
    <div className="relative border-t border-white/[0.04]">
      <Editor
        height="440px"
        language={LANGUAGES[language]?.monacoLang || "plaintext"}
        value={value}
        onChange={(val) => onChange(val ?? "")}
        onMount={handleMount}
        theme="vs-dark"
        loading={
          <div
            className="flex h-[440px] items-center justify-center bg-[#0d1117] font-mono text-sm text-slate-500"
            aria-live="polite"
          >
            <span className="animate-pulse">Chargement de l’éditeur…</span>
          </div>
        }
        options={{
          fontSize: 15,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          fontLigatures: true,
          lineHeight: 24,
          letterSpacing: 0.5,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: "on",
          tabSize: 2,
          insertSpaces: true,
          renderLineHighlight: "line",
          roundedSelection: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          smoothScrolling: true,
          bracketPairColorization: { enabled: true },
          guides: { bracketPairs: true, indentation: true },
          suggest: { showKeywords: true, showSnippets: true },
          quickSuggestions: { other: true, comments: false, strings: true },
          autoClosingBrackets: "always",
          autoClosingQuotes: "always",
          formatOnType: true,
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
            vertical: "auto",
            horizontal: "auto",
            useShadows: false,
          },
          padding: { top: 20, bottom: 20 },
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
          lineNumbersMinChars: 3,
          lineNumbers: "on",
          folding: true,
          showFoldingControls: "mouseover",
          matchBrackets: "always",
          renderWhitespace: "selection",
          stickyScroll: { enabled: false },
        }}
      />
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────────

function loadProgressFromStorage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return { language: "javascript", state: getInitialProgress("javascript") };
  try {
    const parsed = JSON.parse(saved);
    const safeLanguage = parsed.language && LANGUAGES[parsed.language] ? parsed.language : "javascript";
    return {
      language: safeLanguage,
      state: {
        ...getInitialProgress(safeLanguage),
        ...parsed,
        language: safeLanguage,
        editorByLevel: {
          ...createInitialEditorMap(safeLanguage),
          ...(parsed.editorByLevel || {}),
        },
      },
    };
  } catch {
    return { language: "javascript", state: getInitialProgress("javascript") };
  }
}

export default function LearnPage() {
  const [hydrated] = useState(loadProgressFromStorage);
  const [language, setLanguage] = useState(hydrated.language);
  const [state, setState] = useState(hydrated.state);
  const [isRunning, setIsRunning] = useState(false);
  const [pyodideStatus, setPyodideStatus] = useState("idle"); // "idle"|"loading"|"ready"

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, language }));
  }, [state, language]);

  const currentLevel = useMemo(
    () => LEVELS.find((l) => l.id === state.currentLevel) || LEVELS[0],
    [state.currentLevel]
  );

  const totalLevels = LEVELS.length;
  const completedCount = state.completed.length;
  const progressValue = (completedCount / totalLevels) * 100;
  const unlockedMax = Math.min(completedCount + 1, totalLevels);
  const currentCode = state.editorByLevel[currentLevel.id] ?? getStarterCode(currentLevel, language);
  const currentFeedback = state.feedbackByLevel[currentLevel.id];
  const solutionRevealed = !!state.solutionRevealedByLevel?.[currentLevel.id];
  const hintVisible = !!state.showHintByLevel[currentLevel.id];
  const acceptedSolutions = currentLevel.acceptedByLanguage[language] || [];
  const lang = LANGUAGES[language];

  const badges = useMemo(() => {
    const items = [];
    if (completedCount >= 1) items.push({ label: "Premier pas", icon: Trophy, color: "text-yellow-400" });
    if (state.streak >= 3) items.push({ label: "Série ×3", icon: Flame, color: "text-orange-400" });
    if (completedCount >= 5) items.push({ label: "Explorateur", icon: Award, color: "text-blue-400" });
    if (completedCount >= 10) items.push({ label: "Codeur solide", icon: TerminalSquare, color: "text-cyan-400" });
    if (completedCount === totalLevels) items.push({ label: "Maîtrise totale", icon: Sparkles, color: "text-emerald-400" });
    return items;
  }, [completedCount, state.streak, totalLevels]);

  const updateCode = (value) => {
    setState((prev) => ({
      ...prev,
      editorByLevel: { ...prev.editorByLevel, [currentLevel.id]: value },
    }));
  };

  const submitCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    try {
    let isCorrect = false;
    let runtimeError = null;
    let actualOutput = null;
    let isExactMatch = false;
    let errorHint = null;

    if (language === "javascript") {
      const result = runJavaScript(currentCode);
      runtimeError = result.error;
      actualOutput = result.output ?? "";
      isCorrect = !runtimeError && result.output === currentLevel.expectedOutput;
      if (isCorrect && currentLevel.requiredFunctionName) {
        const stripped = stripComments(currentCode);
        const fn = currentLevel.requiredFunctionName;
        const hasDef =
          new RegExp(`function\\s+${fn}\\s*\\(`).test(stripped) ||
          new RegExp(`${fn}\\s*=\\s*function`).test(stripped) ||
          new RegExp(`${fn}\\s*=\\s*\\([^)]*\\)\\s*=>`).test(stripped);
        const hasCall = new RegExp(`${fn}\\s*\\(`).test(stripped);
        if (!hasDef || !hasCall) isCorrect = false;
      }
      if (isCorrect && currentLevel.requiredOperands && currentLevel.requiredOperator) {
        const stripped = stripComments(currentCode);
        const [a, b] = currentLevel.requiredOperands;
        const op = currentLevel.requiredOperator.replace("*", "\\*");
        const hasExpr = new RegExp(`${a}\\s*${op}\\s*${b}`).test(stripped) || new RegExp(`${b}\\s*${op}\\s*${a}`).test(stripped);
        if (!hasExpr) isCorrect = false;
      }
      if (isCorrect && currentLevel.requiredKeyAccess) {
        const stripped = stripComments(currentCode);
        const key = currentLevel.requiredKeyAccess;
        const hasKeyAccess =
          new RegExp(`\\.${key}\\b`).test(stripped) ||
          new RegExp(`\\["\']?${key}["\']?\\]`).test(stripped) ||
          new RegExp(`\\[${key}\\]`).test(stripped);
        if (!hasKeyAccess) isCorrect = false;
      }
      isExactMatch = acceptedSolutions.some((s) => normalizeCode(s) === normalizeCode(currentCode));
      if (!isCorrect) {
        errorHint = analyzeJSFailure(actualOutput, currentLevel.expectedOutput, runtimeError);
      }
    } else if (language === "python") {
      if (!isPyodideReady()) setPyodideStatus("loading");
      const result = await runPython(currentCode);
      setPyodideStatus("ready");
      runtimeError = result.error;
      actualOutput = result.output ?? "";
      isCorrect = !runtimeError && result.output === currentLevel.expectedOutput;
      if (isCorrect && currentLevel.requiredFunctionName) {
        const stripped = stripComments(currentCode);
        const fn = currentLevel.requiredFunctionName;
        const hasDef = new RegExp(`def\\s+${fn}\\s*\\(`).test(stripped);
        const hasCall = new RegExp(`${fn}\\s*\\(`).test(stripped);
        if (!hasDef || !hasCall) isCorrect = false;
      }
      if (isCorrect && currentLevel.requiredOperands && currentLevel.requiredOperator) {
        const stripped = stripComments(currentCode);
        const [a, b] = currentLevel.requiredOperands;
        const op = currentLevel.requiredOperator.replace("*", "\\*");
        const hasExpr = new RegExp(`${a}\\s*${op}\\s*${b}`).test(stripped) || new RegExp(`${b}\\s*${op}\\s*${a}`).test(stripped);
        if (!hasExpr) isCorrect = false;
      }
      if (isCorrect && currentLevel.requiredKeyAccess) {
        const stripped = stripComments(currentCode);
        const key = currentLevel.requiredKeyAccess;
        const hasKeyAccess =
          new RegExp(`\\.${key}\\b`).test(stripped) ||
          new RegExp(`\\["\']?${key}["\']?\\]`).test(stripped) ||
          new RegExp(`\\[${key}\\]`).test(stripped);
        if (!hasKeyAccess) isCorrect = false;
      }
      isExactMatch = acceptedSolutions.some((s) => normalizeCode(s) === normalizeCode(currentCode));
      if (!isCorrect && !runtimeError) {
        errorHint = analyzeJSFailure(actualOutput, currentLevel.expectedOutput, runtimeError);
      }
    } else {
      isCorrect = flexibleMatch(currentCode, currentLevel, language);
      isExactMatch = acceptedSolutions.some((s) => normalizeCode(s) === normalizeCode(currentCode));
      if (!isCorrect) {
        errorHint = analyzePatternFailure(currentCode, currentLevel, language);
      }
    }

    setState((prev) => {
      const alreadyCompleted = prev.completed.includes(currentLevel.id);
      const nextCompleted = isCorrect
        ? alreadyCompleted
          ? prev.completed
          : [...prev.completed, currentLevel.id].sort((a, b) => a - b)
        : prev.completed;
      const nextLevel =
        isCorrect && currentLevel.id < totalLevels
          ? Math.min(currentLevel.id + 1, nextCompleted.length + 1)
          : currentLevel.id;
      const newSubmissions = { ...prev.submissions, [currentLevel.id]: (prev.submissions[currentLevel.id] || 0) + 1 };
      return {
        ...prev,
        currentLevel: nextLevel,
        completed: nextCompleted,
        streak: isCorrect ? prev.streak + 1 : 0,
        submissions: newSubmissions,
        feedbackByLevel: {
          ...prev.feedbackByLevel,
          [currentLevel.id]: {
            success: isCorrect,
            runtimeError,
            actualOutput,
            errorHint,
            showSuggestion: isCorrect && !isExactMatch,
            canonicalSolution: acceptedSolutions[0] || null,
            attempts: newSubmissions[currentLevel.id] || 1,
          },
        },
      };
    });
    } finally {
      setIsRunning(false);
    }
  };

  const revealSolution = () => {
    setState((prev) => ({
      ...prev,
      solutionRevealedByLevel: { ...prev.solutionRevealedByLevel, [currentLevel.id]: true },
    }));
  };

  const resetLevel = () => {
    setState((prev) => ({
      ...prev,
      feedbackByLevel: { ...prev.feedbackByLevel, [currentLevel.id]: null },
      showHintByLevel: { ...prev.showHintByLevel, [currentLevel.id]: false },
      solutionRevealedByLevel: { ...prev.solutionRevealedByLevel, [currentLevel.id]: false },
      editorByLevel: { ...prev.editorByLevel, [currentLevel.id]: getStarterCode(currentLevel, language) },
    }));
  };

  const resetAllProgress = () => setState(getInitialProgress(language));

  const toggleHint = () => {
    setState((prev) => ({
      ...prev,
      showHintByLevel: { ...prev.showHintByLevel, [currentLevel.id]: !prev.showHintByLevel[currentLevel.id] },
    }));
  };

  const selectLevel = (id) => {
    if (id <= unlockedMax) setState((prev) => ({ ...prev, currentLevel: id }));
  };

  const switchLanguage = (value) => {
    setLanguage(value);
    setState({ ...getInitialProgress(value), currentLevel: 1, language: value });
    if (value === "python" && !isPyodideReady()) {
      setPyodideStatus("loading");
      runPython("").then(() => setPyodideStatus("ready")).catch(() => {});
    }
  };

  return (
    <div className="min-h-screen text-white">
      <div className="relative mx-auto flex min-h-screen max-w-[1400px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1117]/90 px-6 py-4 shadow-xl shadow-black/30 backdrop-blur-xl border-b-emerald-500/20"
        >
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" aria-hidden />
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-600/25 ring-1 ring-emerald-400/20">
                <Code2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-mono text-lg font-bold tracking-tight text-white">Viervier Lyngo</h1>
                <p className="text-xs text-slate-500 font-medium">Apprends à coder, niveau par niveau</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-2">
              <StatPill icon={Flame} label="Série" value={state.streak} color="text-orange-400" />
              <StatPill icon={CheckCircle2} label="Terminés" value={`${completedCount}/${totalLevels}`} color="text-emerald-400" />
              <StatPill icon={Zap} label="Niveau" value={currentLevel.id} color="text-emerald-400" />
            </div>

            {/* Progress + Language switcher */}
            <div className="w-full max-w-sm space-y-2.5 lg:max-w-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Progression</span>
                <span className="font-mono text-xs font-bold text-emerald-400">{Math.round(progressValue)}%</span>
              </div>
              <ProgressBar value={progressValue} />
              <div className="flex gap-1 rounded-xl border border-white/[0.06] bg-white/[0.03] p-1">
                {Object.entries(LANGUAGES).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => switchLanguage(key)}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-all duration-150 ${
                      language === key
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.header>

        {/* ── Body ── */}
        <div className="grid flex-1 gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">

          {/* ── Sidebar ── */}
          <motion.aside
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="flex flex-col gap-4"
          >
            {/* Level list */}
            <Card className="flex flex-col overflow-hidden">
              <div className="border-b border-white/[0.06] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-emerald-500/80">&gt;</span>
                  <h2 className="text-sm font-semibold text-white">Niveaux</h2>
                </div>
                <p className="mt-1 text-xs text-slate-500">{completedCount} / {totalLevels} complétés</p>
              </div>
              <div className="flex-1 overflow-auto p-2" style={{ maxHeight: 380 }}>
                <div className="space-y-0.5">
                  {LEVELS.map((level, idx) => {
                    const completed = state.completed.includes(level.id);
                    const locked = level.id > unlockedMax;
                    const active = level.id === currentLevel.id;
                    return (
                      <motion.button
                        key={level.id}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.3) }}
                        onClick={() => selectLevel(level.id)}
                        disabled={locked}
                        className={`group relative w-full rounded-xl px-3 py-2.5 pl-3 text-left transition-all duration-150 ${
                          locked
                            ? "cursor-not-allowed opacity-40"
                            : active
                            ? "bg-emerald-600/15 ring-1 ring-emerald-500/25 border-l-2 border-l-emerald-500"
                            : completed
                            ? "hover:bg-emerald-500/[0.06] border-l-2 border-l-transparent"
                            : "hover:bg-white/[0.04] border-l-2 border-l-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold transition-all ${
                              locked
                                ? "bg-white/[0.04] text-slate-600"
                                : completed
                                ? "bg-emerald-500/20 text-emerald-400"
                                : active
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-white/[0.06] text-slate-400"
                            }`}
                          >
                            {locked ? (
                              <Lock className="h-3 w-3" />
                            ) : completed ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              level.id
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className={`truncate text-xs font-medium ${active ? "text-white" : locked ? "text-slate-600" : "text-slate-300 group-hover:text-white"}`}>
                              {level.title}
                            </div>
                            <div className="mt-0.5 truncate text-[10px] text-slate-600">{level.concept}</div>
                          </div>
                          {active && <ChevronRight className="h-3 w-3 flex-shrink-0 text-emerald-400" />}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Badges */}
            <Card className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="font-mono text-xs text-emerald-500/80">&gt;</span>
                <Trophy className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-white">Badges</h2>
              </div>
              {badges.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {badges.map((badge, i) => {
                    const Icon = badge.icon;
                    return (
                      <motion.span
                        key={badge.label}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] px-2.5 py-1.5 text-xs font-medium text-slate-300"
                      >
                        <Icon className={`h-3.5 w-3.5 ${badge.color}`} />
                        {badge.label}
                      </motion.span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500">Complete ton premier niveau pour débloquer un badge.</p>
              )}
            </Card>
          </motion.aside>

          {/* ── Main ── */}
          <motion.main
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col gap-4"
            role="main"
          >
            {/* Level info card */}
            <Card className="p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                  {/* Tags */}
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-emerald-600/20 px-2.5 py-1 font-mono text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
                      Niveau {currentLevel.id}
                    </span>
                    <span className="rounded-lg bg-white/[0.05] px-2.5 py-1 text-xs font-medium text-slate-400 ring-1 ring-white/[0.08]">
                      {currentLevel.concept}
                    </span>
                    <span className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${lang.badge}`}>
                      <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${lang.dot}`} />
                      {lang.label}
                    </span>
                  </div>
                  <h2 className="font-mono text-xl font-bold tracking-tight text-white">{currentLevel.title}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{currentLevel.pedagogy}</p>
                </div>

                {/* Stats mini */}
                <div className="flex gap-2 md:flex-col">
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-center">
                    <div className="font-mono text-lg font-bold text-white">{state.submissions[currentLevel.id] || 0}</div>
                    <div className="text-[10px] text-slate-600">tentatives</div>
                  </div>
                  <div className={`rounded-xl border px-4 py-2.5 text-center ${
                    state.completed.includes(currentLevel.id)
                      ? "border-emerald-500/20 bg-emerald-500/[0.07]"
                      : "border-white/[0.06] bg-white/[0.03]"
                  }`}>
                    <div className={`font-mono text-lg font-bold ${state.completed.includes(currentLevel.id) ? "text-emerald-400" : "text-slate-600"}`}>
                      {state.completed.includes(currentLevel.id) ? "✓" : "–"}
                    </div>
                    <div className="text-[10px] text-slate-600">statut</div>
                  </div>
                </div>
              </div>

              {/* Mission + Output — style terminal */}
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-white/[0.08] bg-[#0d1117]/80 p-4 font-mono">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-emerald-500">&gt;</span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Mission</span>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300">{currentLevel.task}</p>
                </div>
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] p-4 font-mono">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-emerald-400">&gt;</span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500">Sortie attendue</span>
                  </div>
                  <pre className="overflow-x-auto text-sm leading-relaxed text-emerald-200">{currentLevel.expectedOutput}</pre>
                </div>
              </div>
            </Card>

            {/* Editor card */}
            <Card glow={true} className="overflow-hidden">
              {/* Editor chrome header — style terminal */}
              <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0d1117] px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                    <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                    <div className="h-3 w-3 rounded-full bg-[#28c840]" />
                  </div>
                  <span className="font-mono text-xs text-slate-500">
                    <span className="text-emerald-500/80">~/viervier-lyngo</span>
                    <span className="text-slate-600">/</span>
                    <span className="text-slate-400">main.{lang.extension}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[11px] text-slate-600 sm:flex">
                    <Keyboard className="h-3 w-3" />
                    Ctrl+Enter
                  </span>
                  <Btn variant="ghost" size="sm" onClick={toggleHint}>
                    <HelpCircle className="h-3.5 w-3.5" />
                    {hintVisible ? "Masquer" : "Indice"}
                  </Btn>
                  <Btn variant="ghost" size="sm" onClick={resetLevel}>
                    <RefreshCcw className="h-3.5 w-3.5" />
                    Reset
                  </Btn>
                </div>
              </div>

              {/* Monaco */}
              <CodeEditor value={currentCode} onChange={updateCode} language={language} onSubmit={submitCode} />

              {/* Editor footer */}
              <div className="flex items-center justify-between border-t border-white/[0.06] bg-[#0d1117] px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-[11px] text-slate-600">
                    <span className={`h-2 w-2 rounded-full ${lang.dot}`} />
                    {lang.label}
                  </span>
                  {language === "python" && pyodideStatus === "loading" && (
                    <span className="flex items-center gap-1.5 text-[11px] text-sky-400">
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} className="h-3 w-3 rounded-full border-2 border-sky-400/30 border-t-sky-400" />
                      Chargement Python...
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Btn variant="danger" size="sm" onClick={resetAllProgress}>
                    Réinitialiser tout
                  </Btn>
                  <div className="flex items-center gap-2">
                    <span className="hidden text-xs text-slate-500 sm:inline" title="Raccourci clavier">
                      <Keyboard className="mr-0.5 inline h-3.5 w-3.5" /> Ctrl+Entrée
                    </span>
                    <Btn
                      variant="primary"
                      size="md"
                      onClick={submitCode}
                      disabled={isRunning || pyodideStatus === "loading"}
                      className="px-5"
                      aria-label="Soumettre la solution"
                    >
                      {isRunning ? (
                        <>
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
                          {pyodideStatus === "loading" ? "Chargement de l'environnement Python…" : "Exécution..."}
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          Valider
                        </>
                      )}
                    </Btn>
                  </div>
                </div>
              </div>
            </Card>

            {/* Hint */}
            <AnimatePresence>
              {hintVisible && (
                <motion.div
                  key="hint"
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border-amber-500/20 bg-amber-500/[0.05] p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                        <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 font-mono text-xs font-semibold uppercase tracking-wider text-amber-500">Indice</div>
                        <p className="text-sm leading-relaxed text-amber-200/90">{currentLevel.hint}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Feedback */}
            <AnimatePresence mode="wait">
              {currentFeedback && (
                <motion.div
                  key={`${currentLevel.id}-${currentFeedback.success}-${currentFeedback.runtimeError}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <Card
                    className={
                      currentFeedback.runtimeError
                        ? "border-amber-500/20 bg-amber-500/[0.04]"
                        : currentFeedback.success
                        ? "border-emerald-500/20 bg-emerald-500/[0.05]"
                        : "border-rose-500/20 bg-rose-500/[0.05]"
                    }
                  >
                    <div className="space-y-4 p-5">

                      {/* Header */}
                      <div className="flex items-center gap-3">
                        <motion.div
                          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${
                            currentFeedback.runtimeError
                              ? "bg-amber-500/20"
                              : currentFeedback.success
                              ? "bg-emerald-500/20"
                              : "bg-rose-500/20"
                          }`}
                          initial={currentFeedback.success ? { scale: 0 } : false}
                          animate={currentFeedback.success ? { scale: 1 } : false}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        >
                          {currentFeedback.runtimeError ? (
                            <XCircle className="h-4 w-4 text-amber-400" />
                          ) : currentFeedback.success ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <XCircle className="h-4 w-4 text-rose-400" />
                          )}
                        </motion.div>
                        <div>
                          <h3
                            className={`font-semibold ${
                              currentFeedback.runtimeError
                                ? "text-amber-300"
                                : currentFeedback.success
                                ? "text-emerald-300"
                                : "text-rose-300"
                            }`}
                          >
                            {currentFeedback.runtimeError
                              ? "Erreur d'exécution"
                              : currentFeedback.success
                              ? currentFeedback.showSuggestion ? "Ça fonctionne !" : "Solution validée !"
                              : "Pas encore correct"}
                          </h3>
                        </div>
                      </div>

                      {/* Runtime error */}
                      {currentFeedback.runtimeError && (
                        <div>
                          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-600">
                            Message d'erreur
                          </div>
                          <pre className="overflow-x-auto rounded-xl bg-[#0d1117] p-4 font-mono text-sm leading-relaxed text-amber-300">
                            {currentFeedback.runtimeError}
                          </pre>
                          <p className="mt-2 text-xs text-slate-500">
                            Lis le message ci-dessus — il indique précisément la ligne et la nature du problème.
                          </p>
                        </div>
                      )}

                      {/* Sortie du code vs sortie attendue — affichée dès qu'on a une sortie (JS/Python) */}
                      {!currentFeedback.success && currentFeedback.actualOutput !== undefined && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.05] p-3">
                            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-rose-500">
                              Ta sortie
                            </div>
                            {currentFeedback.actualOutput === "" || currentFeedback.actualOutput === null ? (
                              <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-4">
                                <TerminalSquare className="h-4 w-4 flex-shrink-0 text-slate-500" />
                                <span className="text-sm text-slate-500">Aucune sortie</span>
                              </div>
                            ) : (
                              <pre className="font-mono text-sm text-rose-200 whitespace-pre-wrap break-all">
                                {currentFeedback.actualOutput}
                              </pre>
                            )}
                          </div>
                          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-3">
                            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-500">
                              Sortie attendue
                            </div>
                            <pre className="font-mono text-sm text-emerald-200 whitespace-pre-wrap">
                              {currentLevel.expectedOutput}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Failure hint (no solution shown) */}
                      {!currentFeedback.success && !currentFeedback.runtimeError && currentFeedback.errorHint && (
                        <div className="rounded-xl border border-rose-500/10 bg-rose-500/[0.04] p-4">
                          <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-rose-600">
                            Où regarder
                          </div>
                          <p className="text-sm leading-relaxed text-slate-300">{currentFeedback.errorHint}</p>
                        </div>
                      )}

                      {/* Reveal solution button — shown after 3+ failed attempts */}
                      {!currentFeedback.success && (currentFeedback.attempts ?? 0) >= 3 && !solutionRevealed && (
                        <div className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3">
                          <div className="flex-1 text-xs text-slate-500">
                            Tu bloques depuis un moment — tu peux révéler la solution si besoin.
                          </div>
                          <Btn variant="secondary" size="sm" onClick={revealSolution}>
                            Voir la solution
                          </Btn>
                        </div>
                      )}

                      {/* Solution revealed */}
                      {!currentFeedback.success && solutionRevealed && currentFeedback.canonicalSolution && (
                        <div>
                          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
                            Solution de référence
                          </div>
                          <pre className="overflow-x-auto rounded-xl bg-[#0d1117] p-4 font-mono text-sm leading-relaxed text-slate-300">
                            {currentFeedback.canonicalSolution}
                          </pre>
                        </div>
                      )}

                      {/* Success suggestion */}
                      {currentFeedback.success && currentFeedback.showSuggestion && currentFeedback.canonicalSolution && (
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4">
                          <div className="mb-2 flex items-center gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
                              Suggestion de style
                            </span>
                          </div>
                          <p className="mb-3 text-xs text-slate-500">
                            Ton approche marche parfaitement. Voici la façon la plus courante pour ce niveau :
                          </p>
                          <pre className="overflow-x-auto rounded-lg bg-[#0d1117] p-3 font-mono text-sm leading-relaxed text-emerald-200">
                            {currentFeedback.canonicalSolution}
                          </pre>
                        </div>
                      )}

                      {/* Explanation */}
                      <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-3">
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Explication
                        </div>
                        <p className="text-sm leading-relaxed text-slate-400">{currentLevel.explanation}</p>
                      </div>

                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.main>
        </div>
      </div>
    </div>
  );
}
