/*
    Pack.java
    v1.0
    Created : 29/04/23
    Modified: 29/04/23
*/

package dp1soft.app.model;

//Es el modelo para un paquete
public class Pack {

    //region Atributos
    //Id único del pedido
    private int id;
    //Id del cliente
    private int idCustomer;
    //Tiempo en el que se registró
    private int originalTime;
    //Tiempo límite de entrega
    private int deadline;
    //Tiempo en el que se encoló por última vez
    private int time;
    //Cúantos paquetes se demandan
    private int demand;
    //Cuántos paquetes ya se entregaron
    private int fullfilled;
    //Cuántos paquetes aún no están asignados
    private int unassigned;
    //Ubicación del pedido
    private Node location;
    //endregion

    //region Getters/Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getIdCustomer() {
        return idCustomer;
    }

    public void setIdCustomer(int idCustomer) {
        this.idCustomer = idCustomer;
    }

    public int getOriginalTime() {
        return originalTime;
    }

    public void setOriginalTime(int originalTime) {
        this.originalTime = originalTime;
    }

    public int getDeadline() {
        return deadline;
    }

    public void setDeadline(int deadline) {
        this.deadline = deadline;
    }

    public int getTime() {
        return time;
    }

    public void setTime(int time) {
        this.time = time;
    }

    public int getDemand() {
        return demand;
    }

    public void setDemand(int demand) {
        this.demand = demand;
    }

    public int getFullfilled() {
        return fullfilled;
    }

    public void setFullfilled(int fullfilled) {
        this.fullfilled = fullfilled;
    }

    public int getUnassigned() {
        return unassigned;
    }

    public void setUnassigned(int unassigned) {
        this.unassigned = unassigned;
    }

    public Node getLocation() {
        return location;
    }

    public void setLocation(Node location) {
        this.location = location;
    }
    //endregion

}
