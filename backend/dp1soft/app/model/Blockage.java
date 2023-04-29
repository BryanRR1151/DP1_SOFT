/*
    Blockage.java
    v1.0
    Created : 29/04/23
    Modified: 29/04/23
*/

package dp1soft.app.model;

//Modelo para un bloqueo programado
public class Blockage {

    //region Atributos
    //Nodo que será bloqueado
    private Node node;
    //Tiempo en el que empezará
    private int start;
    //Tiempo en el que terminará
    private int end;
    //endregion

    //region Getters/Setters
    public Node getNode() {
        return node;
    }

    public void setNode(Node node) {
        this.node = node;
    }

    public int getStart() {
        return start;
    }

    public void setStart(int start) {
        this.start = start;
    }

    public int getEnd() {
        return end;
    }

    public void setEnd(int end) {
        this.end = end;
    }
    //endregion

}
