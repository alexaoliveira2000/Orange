// closure
var Casa = (function () {
    var show = function () {
        return `Zona: ${this.zona}, Preco: ${Number(this.preco).toFixed(2)}`;
    }
    return function (zona, preco) {
        this.zona = zona;
        this.preco = preco;
        this.show = show;
    }
})();

var init = function () {
    var listaCasas = document.getElementById("listaCasas");
    var btnInserir = document.getElementById("btnAdd");
    var btnRemover = document.getElementById("btnRemove");

    var inserir = function () {
        var newCasa = prompt("Zona|Preco");
        if (newCasa) {
            let arrDadosCasa = newCasa.split("|");
            return new Casa(arrDadosCasa[0], arrDadosCasa[1]);
        }
    }

    /*
    var remover = function() {
        var zona = prompt("Zona");
        if (zona) {
            let casas = document.getElementsByTagName("li");
            for (let i = 0; i < casas.length; i++) {
                if (casas[i].textContent.includes(`Zona: ${zona}, `)) {
                    listaCasas.removeChild(casas[i]);
                }
            }
        }
    }
    */

    var remover = function () {
        return prompt("Zona") || "";
    }

    btnInserir.addEventListener("click", function (evt) {
        var newCasa = inserir();
        var li = document.createElement("li");
        var txtLi = document.createTextNode(newCasa.show());
        li.appendChild(txtLi);
        listaCasas.appendChild(li);
    })

    //btnRemover.addEventListener("click", remover)
    btnRemover.addEventListener("click", function () {
        var zona = remover();
        var node = listaCasas.firstChild;
        var tempNode;
        while (node) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                tempNode = node.nextSibling;
                if (node.textContent.includes(`Zona: ${zona}, `)) {
                    node.parentNode.removeChild(node);
                }
                node = tempNode;
            }
        }
    })
}

window.onload = init;
//window.addEventListener("DOMContentLoaded", init);

function Apartamento(local, tipo) {
    this.local = local;
    this.tipo = tipo;
    this.show = function () {
        console.log("Apartamento:" + this.local + "," +
            this.tipo);
    };
}

var Apartamento2 = (function () {
    function show() {
        console.log("Apartamento:" + this.local +
            "," + this.tipo);
    };
    return function Apartamento(local, tipo) {
        this.local = local;
        this.tipo = tipo;
        this.show = show;
    };
}());

function Apartamento3(local, tipo) {
    this.local = local;
    this.tipo = tipo;
}
Apartamento3.prototype.show = function () {
    console.log("Apartamento:" + this.local
        + "," + this.tipo);
};

function Apartamento4(local, tipo) {
    this.local = local;
    this.tipo = tipo;
    if (Apartamento4.__inicializado__ === void 0) {
        Apartamento4.prototype.show = function () {
            console.log("Apartamento:" + this.local
                + "," + this.tipo);
            Apartamento4.__inicializado__ = true;
        }
    }
}

function criarApartamento(local, tipo) {
    var aux = new Object();
    aux.local = local;
    aux.tipo = tipo
    aux.show = function () {
        console.log("Apartamento:" +
            this.local + "," + this.tipo);
    };
    return aux;
}


var Apartamento = {
    nome: "ze",
    show: function () {

    }
}


function Imovel(matriz, local, preco) {
    this.matriz = matriz;
    this.local = local;
    this.preco = preco;
    this.showInfo = function () {
        console.log(this.matriz + "," +
            this.local + "," + this.preco);
    };
}
function Apartamento(matriz, local, preco, tipo, ano) {
    Imovel.call(this, matriz, local, preco);
    //Imovel.apply(this, arguments);
    this.tipo = tipo;
    this.ano = ano;
    this.showInfo = function () {
        console.log(this.matriz + ", " + this.local + ", " +
            this.preco + ", " + this.tipo +
            ", " + this.ano);
    };
}




function Animal(nome, idade) {
    this.nome = nome;
    this.idade = idade;
    // propriedade estática
    Animal.contador = (Animal.contador === void 0) ? 1 : ++Animal.contador;
}
Animal.equals = function (a1, a2) {/***/ } // método estático
Animal.prototype.info = function () {
    // Template literal OU interpolação
    return `Nome:${this.nome}, Idade:${this.idade}`;
}
function Cao(nome, idade, raca) {
    Animal.call(this, nome, idade) //Este this é do cão, assim ligamos as classes
    this.raca = raca
}
Cao.prototype = Object.create(Animal.prototype);
Cao.prototype.constructor = Cao;
Cao.prototype.info = function () {
    return `${Animal.prototype.info.call(this)}, Raca:${this.raca}`
}


function Motor(potencia) {
    this.potencia = potencia;
    this.ligado = false;
}
Motor.prototype.onoff = function () { this.ligado = !this.ligado; };
Motor.prototype.info = function () {
    return "Motor:" + this.potencia + "Kw, Ligado:" + this.ligado;
}
class MotorEletrico extends Motor {
    #genero = "PINTURA";
    static nome = "ZE";
    constructor(genero, potencia, frequencia, nmrDePolos) {
        super(potencia);
        this.frequencia = frequencia;
        this.nmrDePolos = nmrDePolos;
        this.#genero = genero;
    }
    get genero() { return this.#genero; }
    set genero(genero) { this.#genero = genero; }
    info() {
        return super.info() + ", Freq.:" + this.frequencia +
            "Hz, Polos:" + this.nmrDePolos;
    }
    static equals(m1, m2) { }
}





var planet = (function (_name) {
    var planet = {};
    Object.defineProperty(planet, "name", {
        get: function () {
            return _name;
        },
        set: function (value) {
            _name = value;
        },
        enumerable: true,
        configurable: true
    });
    return planet;
}("Terra"));

Object.getOwnPropertyDescriptor(veiculo, "marca")


var descritor = Object.getOwnPropertyDescriptor(objeto, atributo);
descritor.writable = false;
Object.defineProperty(objeto, atributo, descritor);
//Object.freeze(objeto); // = a descritor.configurable = false
Object.keys(object); // devolve atributos enum
Object.getOwnPropertyNames(objeto); // devolve atributos enum e não enum
Object.preventExtensions(objeto); // não dá para add mais atributos ao obj
Object.isExtensible(objeto); // valida se dá para add mais atributos ao obj
Object.seal(objeto); // não dá para add, elim, e conf atributos ao obj
Object.isSealed(objeto);
hasOwnProperty(atributo)
propertyIsEnumerable(atributo)
isPrototypeOf(objeto)

function isArray(obj) {
    return (!!obj && typeof (obj) === 'object' &&
        typeof (obj.length) === "number" &&
        !obj.propertyIsEnumerable("length"))
}








let cloneObjectV2 = function (obj) {
    let aux = {};

    let isArray = function (obj) {
        return (obj && typeof (obj) === "object" &&
            obj.constructor === Array &&
            typeof (obj.length) === "number" &&
            !obj.propertyIsEnumerable("length") &&
            typeof (obj.splice) === "function") ? true : false;
    }

    if (typeof (obj) === "object" && !isArray(obj)) {
        //return  { ...obj };
        for (atributo in obj) {
            aux[atributo] = obj[atributo];
        }
    }
    return aux;
}

var EstadoCivil = {
    SOLTEIRO: 1,
    CASADO: 2,
    VIUVO: 3,
    DIVORCIADO: 4,
    properties: {
        1: {
            descricao: "Estado Civil: Casado",
            codigo: "C"
        },
        2: {
            descricao: "Estado Civil: Solteiro",
            codigo: "s"
        },
        3: {
            descricao: "Estado Civil: Viúvo",
            codigo: "v"
        },
        4: {
            descricao: "Estado Civil: Divorciado",
            codigo: "D"
        }
    }
}

// let e2 = EstadoCivil.SOLTEIRO;
// EstadoCivil.properties(e2); -> Retorna-me o objeto com a descriçãoo e o código











let termometro = Sensor;
termometro.unidade = "C";
termometro.valor = 25;
function conversor(fn, unidade) {
    fn(unidade);
}
conversor(termometro.showInfo.bind(termometro), "F");