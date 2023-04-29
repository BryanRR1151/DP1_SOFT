/*
    Environment.java
    v1.0
    Created : 29/04/23
    Modified: 29/04/23
*/

package dp1soft.app.model;

import java.util.ArrayList;

//Modelo para el entorno de la simulación
public class Environment {

    //region Atributos
    //Arreglo de nodos, representa el mapa
    private ArrayList<Node> map;
    //Lista de bloqueos encolados y por encolar
    private ArrayList<Blockage> blockList;
    //Tiempo actual de la simulación
    private int time;
    //endregion

    //region Getters/Setters
    public ArrayList<Node> getMap() {
        return map;
    }

    public void setMap(ArrayList<Node> map) {
        this.map = map;
    }

    public ArrayList<Blockage> getBlockList() {
        return blockList;
    }

    public void setBlockList(ArrayList<Blockage> blockList) {
        this.blockList = blockList;
    }

    public int getTime() {
        return time;
    }

    public void setTime(int time) {
        this.time = time;
    }
    //endregion

}
