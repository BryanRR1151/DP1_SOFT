/*
    Chrom.java
    v1.0
    Created : 29/04/23
    Modified: 29/04/23
*/

package dp1soft.app.model;

//Es el modelo para un cromosoma de una solución
public class Chrom {

    //region Atributos
    //Ubicación inicial
    private final Node from;
    //Ubicación final
    private final Node to;
    //endregion

    //region Getters/Setters
    public Node getFrom() {
        return from;
    }

    public void setFrom(Node from) {
        this.from.setX(from.getX());
        this.from.setY(from.getY());
    }

    public Node getTo() {
        return to;
    }

    public void setTo(Node to) {
        this.to.setX(to.getX());
        this.to.setY(to.getY());
    }
    //endregion

    //region Constructores
    public Chrom(){
        this.from = new Node();
        this.to = new Node();
    }
    @Override
    public boolean equals(Object obj) {
        boolean eq = false;
        if(getClass() == obj.getClass()){
            Chrom c = (Chrom) obj;
            if(this.from.equals(c.from) && this.to.equals(c.to)){
                eq = true;
            }
        }
        return eq;
    }
    //endregion
}
