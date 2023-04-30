/*
    Node.java
    v1.0
    Created : 29/04/23
    Modified: 29/04/23
*/

package dp1soft.app.model;

import static java.lang.Math.abs;

//Es el modelo para un punto en el mapa
public class Node {

    //region Atributos
    //Posición x
    private int x;
    //Posición y
    private int y;
    //Está bloqueado?
    private boolean isBlocked;
    //Es destino de un paquete?
    private boolean isDestination;
    //endregion

    //region Getters/Setters
    public int getX() {
        return x;
    }

    public void setX(int x) {
        this.x = x;
    }

    public int getY() {
        return y;
    }

    public void setY(int y) {
        this.y = y;
    }

    public boolean isBlocked() {
        return isBlocked;
    }

    public void setBlocked(boolean blocked) {
        isBlocked = blocked;
    }

    public boolean isDestination() {
        return isDestination;
    }

    public void setDestination(boolean destination) {
        isDestination = destination;
    }
    //endregion

    //region Constructores
    public Node(){

    }
    public Node(Node node){
        this.x = node.x;
        this.y = node.y;
        this.isBlocked = node.isBlocked;
        this.isDestination = node.isDestination;
    }
    public Node(int x, int y){
        this.x = x;
        this.y = y;
    }
    //endregion

    //region Métodos
    @Override
    public boolean equals(Object obj) {
        boolean eq = false;
        if(getClass() == obj.getClass()){
            Node n = (Node) obj;
            if(this.x == n.x && this.y == n.y){
                eq = true;
            }
        }
        return eq;
    }
    public int distance(Node n){
        return abs(this.x - n.x) + abs(this.y - n.y);
    }
    //endregion

}
